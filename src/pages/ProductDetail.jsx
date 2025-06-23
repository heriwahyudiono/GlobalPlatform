import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import { ShoppingCart } from 'lucide-react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Load Snap.js once saat komponen dimuat
  useEffect(() => {
    const loadSnapScript = () => {
      if (!document.getElementById('snap-script')) {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', 'SB-Mid-client-kSVkRneeAHCbWpuo'); // ganti dengan client key kamu
        script.id = 'snap-script';
        script.async = true;
        document.body.appendChild(script);
      }
    };
    loadSnapScript();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*, product_images(id, product_image)')
          .eq('id', id)
          .single();

        if (productError) throw productError;

        setProduct(productData);
        setProductImages(productData.product_images || []);

        if (productData.user_id) {
          const { data: ownerData, error: ownerError } = await supabase
            .from('profiles')
            .select('id, name, profile_picture')
            .eq('id', productData.user_id)
            .single();
          if (ownerError) throw ownerError;
          setOwner(ownerData);
        }

        await fetchComments();
      } catch (err) {
        console.error(err);
        setError('Produk tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, comment, created_at, user_id, profiles:user_id(id, name, profile_picture)')
        .eq('product_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return navigate('/login');
    setIsSubmittingComment(true);

    try {
      const { error } = await supabase.from('comments').insert([{
        user_id: session.user.id,
        product_id: id,
        comment: newComment.trim()
      }]);
      if (error) throw error;

      await fetchComments();
      setNewComment('');
    } catch (err) {
      alert('Gagal mengirim komentar: ' + err.message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleAddToCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return navigate('/login');

    try {
      const { data: existingCart } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (existingCart) {
        await supabase
          .from('carts')
          .update({ quantity: existingCart.quantity + 1, updated_at: new Date().toISOString() })
          .eq('id', existingCart.id);
      } else {
        await supabase
          .from('carts')
          .insert({
            user_id: session.user.id,
            product_id: product.id,
            quantity: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      alert('Produk ditambahkan ke keranjang');
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan ke keranjang');
    }
  };

  const handleBuyNow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (profileError) throw new Error('Gagal mendapatkan data profil');

      const res = await fetch('http://localhost:5000/api/payments/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            quantity: 1,
            products: {
              id: product.id,
              product_name: product.product_name,
              price: product.price
            }
          }],
          user: {
            name: profile.name,
            email: user.email
          }
        })
      });

      const result = await res.json();
      if (!result.token) throw new Error('Gagal mendapatkan token Midtrans');

      // Tunggu snap.js tersedia
      const waitSnap = () =>
        new Promise((resolve) => {
          const check = () => {
            if (window.snap) resolve();
            else setTimeout(check, 200);
          };
          check();
        });
      await waitSnap();

      window.snap.pay(result.token, {
        onSuccess: async (res) => {
          await supabase.from('transactions').insert([{
            user_id: user.id,
            order_id: res.order_id,
            product_id: product.id,
            quantity: 1,
            payment_type: res.payment_type,
            transaction_status: res.transaction_status,
            gross_amount: parseFloat(res.gross_amount),
            payment_data: res
          }]);
          alert('Pembayaran berhasil!');
        },
        onPending: async (res) => {
          await supabase.from('transactions').insert([{
            user_id: user.id,
            order_id: res.order_id,
            product_id: product.id,
            quantity: 1,
            payment_type: res.payment_type,
            transaction_status: res.transaction_status,
            gross_amount: parseFloat(res.gross_amount),
            payment_data: res
          }]);
          alert('Transaksi menunggu pembayaran.');
        },
        onError: (res) => {
          alert('Transaksi gagal.');
          console.error('Midtrans error:', res);
        },
        onClose: () => {
          console.log('Transaksi dibatalkan oleh user.');
        }
      });
    } catch (err) {
      console.error('Checkout gagal:', err.message);
      alert('Checkout gagal: ' + err.message);
    }
  };

  if (error) {
    return (
      <>
        <Navbar />
        <p className="text-center mt-10 text-red-600">{error}</p>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <p className="text-center mt-10">Memuat produk...</p>
      </>
    );
  }

  const discount = 10;
  const discountPrice = (product.price * (1 - discount / 100)).toFixed(2);
  const rating = product.rating || 4;
  const mainImage = productImages[0]?.product_image || '/default-product.png';

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/2">
              <img src={mainImage} alt={product.product_name} className="w-full h-64 object-contain rounded mb-4" />
            </div>
            <div className="md:w-1/2">
              <h1 className="text-xl font-bold">{product.product_name}</h1>
              <p className="text-sm text-gray-600 mt-2">{product.description}</p>
              <div className="flex items-center gap-2 mt-2">
                {[...Array(5)].map((_, index) => (
                  <span key={index}>{index < rating ? <FaStar className="text-yellow-500 w-4 h-4" /> : <FaRegStar className="text-yellow-500 w-4 h-4" />}</span>
                ))}
              </div>
              <div className="text-lg text-green-600 font-semibold mt-2">Rp{discountPrice}</div>
              <div className="text-sm text-gray-400 line-through">Rp{product.price}</div>
              <div className="mt-4 flex gap-2">
                <button onClick={handleBuyNow} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">Beli Sekarang</button>
                <button onClick={handleAddToCart} className="p-2 border border-green-600 text-green-600 rounded hover:bg-green-50">
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Komentar */}
          <div className="mt-6 border-t pt-4">
            <h2 className="font-semibold mb-2">Komentar ({comments.length})</h2>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar..."
              className="w-full p-2 border rounded"
              rows="3"
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSubmittingComment}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
            >
              {isSubmittingComment ? 'Mengirim...' : 'Kirim'}
            </button>

            <div className="mt-4 space-y-3">
              {comments.map(comment => (
                <div key={comment.id}>
                  <p className="font-medium text-sm">{comment.profiles?.name}</p>
                  <p className="text-sm">{comment.comment}</p>
                  <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;

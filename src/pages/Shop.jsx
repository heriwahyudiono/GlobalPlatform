import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, product_images(id, product_image)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setProducts(data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat produk.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleBuyNow = async (product) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/login');

    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            quantity: 1,
            products: {
              id: product.id,
              product_name: product.product_name,
              price: product.price,
            },
          },
        ],
        user: {
          name: profile?.name || 'User',
          email: user.email,
        },
      }),
    });

    const result = await res.json();

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
        alert('Menunggu pembayaran.');
      },
      onError: () => alert('Transaksi gagal.'),
      onClose: () => console.log('Transaksi dibatalkan.')
    });
  };

  const handleAddToCart = async (product) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return navigate('/login');

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
  };

  // Snap.js loader
  useEffect(() => {
    if (!document.getElementById('snap-script')) {
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', 'SB-Mid-client-kSVkRneeAHCbWpuo');
      script.id = 'snap-script';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <>
      <Navbar />

      <div className="container mx-auto px-4 py-6 mb-24">
        <h1 className="text-2xl font-semibold mb-4">Shop</h1>

        {loading && <p>Memuat produk...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const image = product.product_images?.[0]?.product_image || '/default-product.png';
            const discount = 10; // 10% diskon
            const finalPrice = Math.floor(product.price * (1 - discount / 100));

            return (
              <div key={product.id} className="bg-white rounded-lg shadow p-4">
                <img
                  src={image}
                  alt={product.product_name}
                  className="w-full h-48 object-contain rounded"
                />
                <h2 className="mt-2 font-bold text-lg line-clamp-1">{product.product_name}</h2>
                <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>

                <div className="mt-2 flex items-center gap-1 text-yellow-500 text-sm">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={16} fill="currentColor" />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">(200)</span>
                </div>

                <div className="mt-2 text-green-600 font-bold text-base">
                  Rp{finalPrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400 line-through">
                  Rp{product.price.toLocaleString()}
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>Stok: {product.stock || 100}</span>
                  <span>Terjual: {product.sold || 80}</span>
                  <span className="text-red-500">{discount}% OFF</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleBuyNow(product)}
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm"
                  >
                    Beli Sekarang
                  </button>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="p-2 border border-green-600 text-green-600 rounded hover:bg-green-50"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 w-full z-50">
        <BottomNav />
      </div>
    </>
  );
};

export default Shop;

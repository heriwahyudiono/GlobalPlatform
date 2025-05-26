import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import { ShoppingCart } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError('Produk tidak ditemukan.');
        setProduct(null);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate('/'); // atau navigate('/login') kalau punya halaman login
      return;
    }

    try {
      const { data: existingCart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (cartError) throw cartError;

      if (existingCart) {
        const { error: updateError } = await supabase
          .from('carts')
          .update({
            quantity: existingCart.quantity + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCart.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('carts')
          .insert({
            product_id: product.id,
            user_id: session.user.id,
            quantity: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      alert('Produk berhasil ditambahkan ke keranjang');
    } catch (err) {
      console.error('Error:', err);
      alert('Gagal menambahkan ke keranjang: ' + err.message);
    }
  };

  const handleBuyNow = () => {
    alert('Fitur beli sekarang belum diimplementasikan.');
    // Nanti bisa diarahkan ke halaman checkout atau proses pembayaran
  };

  if (loading) return <p className="text-center mt-10">Memuat produk...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!product) return null;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">{product.product_name}</h1>
        <img
          src={product.product_image || '/default-product.png'}
          alt={product.product_name}
          className="w-full max-w-md object-contain rounded mb-6 mx-auto"
        />
        <p className="mb-4 text-green-600 font-bold text-2xl">
          Rp {product.price.toLocaleString('id-ID')}
        </p>
        <p className="mb-8">{product.description}</p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleBuyNow}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition"
          >
            Beli Sekarang
          </button>
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center p-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition"
            aria-label="Tambah ke keranjang"
          >
            <ShoppingCart className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import { ShoppingCart } from 'lucide-react';
import { FaStar, FaRegStar } from 'react-icons/fa';

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
      navigate('/login'); // arahkan ke login jika belum auth
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
    // Bisa diarahkan ke checkout/payment page nanti
  };

  if (loading) return <p className="text-center mt-10">Memuat produk...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!product) return null;

  // Data tambahan mirip Home.jsx
  const discount = 10;
  const discountPrice = (product.price * (1 - discount / 100)).toFixed(2);
  const rating = product.rating || 4;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2 flex justify-center items-center">
              <img
                src={product.product_image || '/default-product.png'}
                alt={product.product_name}
                className="w-full max-w-md object-contain rounded"
              />
            </div>
            <div className="md:w-1/2 flex flex-col">
              <h1 className="text-3xl font-bold mb-4">{product.product_name}</h1>
              <p className="text-gray-600 mb-3 line-clamp-3">{product.description}</p>

              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }, (_, index) => (
                  <span key={index}>
                    {rating > index ? (
                      <FaStar className="text-yellow-500 w-5 h-5" />
                    ) : (
                      <FaRegStar className="text-yellow-500 w-5 h-5" />
                    )}
                  </span>
                ))}
                <span className="text-gray-500 text-sm ml-3">{product.stock || 100} stok</span>
              </div>

              <div className="text-sm text-gray-500 mb-3">{(product.sold || 200)} terjual</div>

              <div className="flex flex-col mb-6 space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-green-600 font-bold text-3xl">Rp{discountPrice}</span>
                  <span className="text-gray-400 line-through text-lg">Rp{product.price}</span>
                  <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full">
                    {discount}% OFF
                  </span>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-800 w-fit px-3 py-1 rounded">
                  COD Tersedia
                </span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition"
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
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;

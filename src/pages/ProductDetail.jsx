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
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductAndOwner = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch product data
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (productError) throw productError;

        setProduct(productData);

        // Fetch owner profile data
        if (productData && productData.user_id) {
          const { data: ownerData, error: ownerError } = await supabase
            .from('profiles')
            .select('name, profile_picture')
            .eq('id', productData.user_id)
            .single();

          if (ownerError) throw ownerError;

          setOwner(ownerData);
        }
      } catch (err) {
        setError('Produk tidak ditemukan.');
        setProduct(null);
        setOwner(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndOwner();
  }, [id]);

  const handleAddToCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate('/login');
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
    alert('Fitur belum tersedia');
  };

  if (error) return (
    <>
      <Navbar />
      <p className="text-center mt-10 text-red-600">{error}</p>
    </>
  );

  if (!product) return (
    <>
      <Navbar />
      <p className="text-center mt-10">Produk tidak ditemukan</p>
    </>
  );

  const discount = 10;
  const discountPrice = (product.price * (1 - discount / 100)).toFixed(2);
  const rating = product.rating || 4;

  return (
    <>
      <Navbar />
      {loading ? (
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-center mt-10">Memuat produk...</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-1/2 flex justify-center items-center">
                <img
                  src={product.product_image || '/default-product.png'}
                  alt={product.product_name}
                  className="w-full max-w-xs object-contain rounded"
                />
              </div>
              <div className="md:w-1/2 flex flex-col">
                <h1 className="text-2xl font-bold mb-3">{product.product_name}</h1>
                <p className="text-gray-600 mb-2 text-sm line-clamp-3">{product.description}</p>

                <div className="flex items-center mb-3">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span key={index}>
                      {rating > index ? (
                        <FaStar className="text-yellow-500 w-4 h-4" />
                      ) : (
                        <FaRegStar className="text-yellow-500 w-4 h-4" />
                      )}
                    </span>
                  ))}
                  <span className="text-gray-500 text-xs ml-3">{product.stock || 100} stok</span>
                </div>

                <div className="text-xs text-gray-500 mb-2">{product.sold || 200} terjual</div>

                <div className="flex flex-col mb-4 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 font-bold text-xl">Rp{discountPrice}</span>
                    <span className="text-gray-400 line-through text-sm">Rp{product.price}</span>
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                      {discount}% OFF
                    </span>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 w-fit px-2 py-0.5 rounded">
                    COD Tersedia
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition text-sm"
                  >
                    Beli Sekarang
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center justify-center p-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition"
                    aria-label="Tambah ke keranjang"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bagian pemilik produk dipindahkan ke bawah */}
            {owner && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link
                  to={`/profile/${product.user_id}`}
                  className="flex items-center space-x-2 p-2 rounded-lg w-fit"
                >
                  <img
                    src={owner.profile_picture || '/default-profile.png'}
                    alt={owner.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-medium text-sm">{owner.name}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetail;
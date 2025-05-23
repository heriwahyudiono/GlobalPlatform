import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import { useUser } from '../UserContext';

const Carts = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        navigate('/login');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('carts')
          .select(`
            id,
            quantity,
            products (
              id,
              product_name,
              price,
              description,
              product_image
            )
          `)
          .eq('user_id', session.user.id);

        if (error) throw error;

        setCartItems(data || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const handleRemoveFromCart = async (cartId) => {
    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('id', cartId);

      if (error) throw error;

      setCartItems(prev => prev.filter(item => item.id !== cartId));
    } catch (err) {
      alert('Gagal menghapus item dari keranjang: ' + err.message);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center mt-10 text-xl">Memuat keranjang...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="text-center mt-10 text-xl text-red-500">Error: {error}</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-20">
        <h1 className="text-2xl font-bold text-center mb-8">Keranjang Belanja</h1>
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-600">Keranjang kamu masih kosong.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cartItems.map(item => {
              const product = item.products;
              const discount = 10;
              const discountPrice = (product.price * (1 - discount / 100)).toFixed(2);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={product.product_image}
                      alt={product.product_name}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-1 line-clamp-1">{product.product_name}</h2>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>

                    <div className="flex items-center mb-2 space-x-2">
                      <span className="text-green-600 font-bold text-lg">Rp{discountPrice}</span>
                      <span className="text-sm text-gray-400 line-through">Rp{product.price}</span>
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                        {discount}% OFF
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">Jumlah: {item.quantity}</p>

                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition">
                        Checkout
                      </button>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="p-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition"
                        title="Hapus dari keranjang"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Carts;

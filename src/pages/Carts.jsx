import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import { useUser } from '../UserContext';

const Carts = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
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
              product_images (product_image)
            )
          `)
          .eq('user_id', session.user.id);

        if (error) throw error;

        // Format data untuk mengambil gambar pertama dari product_images
        const formattedData = data.map(item => ({
          ...item,
          products: {
            ...item.products,
            product_image: item.products.product_images && item.products.product_images.length > 0 
              ? item.products.product_images[0].product_image 
              : 'https://via.placeholder.com/300'
          }
        }));

        setCartItems(formattedData || []);
        setSelectedItems([]);
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
      const { error } = await supabase.from('carts').delete().eq('id', cartId);
      if (error) throw error;

      setCartItems(prev => prev.filter(item => item.id !== cartId));
      setSelectedItems(prev => prev.filter(id => id !== cartId));
    } catch (err) {
      alert('Gagal menghapus item: ' + err.message);
    }
  };

  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const { error } = await supabase
        .from('carts')
        .update({ quantity: newQuantity })
        .eq('id', cartId);

      if (error) throw error;

      setCartItems(prev =>
        prev.map(item =>
          item.id === cartId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      alert('Gagal memperbarui jumlah: ' + err.message);
    }
  };

  const handleSelectItem = (cartId) => {
    setSelectedItems((prev) =>
      prev.includes(cartId)
        ? prev.filter(id => id !== cartId)
        : [...prev, cartId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      const allIds = cartItems.map(item => item.id);
      setSelectedItems(allIds);
      setSelectAll(true);
    }
  };

  const handleCheckout = () => {
    const itemsToCheckout = cartItems.filter(item => selectedItems.includes(item.id));
    alert('Checkout item:\n' + itemsToCheckout.map(item => item.products.product_name).join('\n'));
    // Lanjutkan proses checkout sesuai kebutuhan
  };

  const getTotalSelectedPrice = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => {
        const discount = 10;
        const discountPrice = item.products.price * (1 - discount / 100);
        return total + discountPrice * item.quantity;
      }, 0)
      .toFixed(2);
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
          <>
            <div className="flex items-center mb-4 gap-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-5 h-5"
              />
              <label className="text-gray-700">Pilih Semua</label>
            </div>

            <div className="space-y-4 pb-24">
              {cartItems.map(item => {
                const product = item.products;
                const discount = 10;
                const discountPrice = (product.price * (1 - discount / 100)).toFixed(2);

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-white rounded-lg shadow p-4"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="w-5 h-5"
                    />
                    <img
                      src={product.product_image}
                      alt={product.product_name}
                      className="w-24 h-24 object-contain rounded"
                    />
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold">{product.product_name}</h2>
                      <p className="text-gray-600 text-sm">{product.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-green-600 font-bold text-lg">Rp{discountPrice}</span>
                        <span className="text-sm text-gray-400 line-through">Rp{product.price}</span>
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                          {discount}% OFF
                        </span>
                      </div>
                      <div className="flex items-center mt-2 gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="p-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Hapus dari keranjang"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Tombol Checkout Fixed */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 right-0 p-4 w-full sm:w-auto bg-white border-t shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-8 sm:rounded-tl-lg">
          <span className="text-lg font-semibold">
            Total: <span className="text-green-600">Rp{getTotalSelectedPrice()}</span>
          </span>
          <button
            onClick={handleCheckout}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-semibold disabled:opacity-50"
            disabled={selectedItems.length === 0}
          >
            Checkout ({selectedItems.length})
          </button>
        </div>
      )}
    </>
  );
};

export default Carts;
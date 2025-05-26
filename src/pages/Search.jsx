import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import { ShoppingCart } from 'lucide-react';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Search = () => {
  const query = useQuery();
  const keyword = query.get('keyword') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!keyword.trim()) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('product_name', `%${keyword}%`)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        setProducts([]);
      } else {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [keyword]);

  const handleAddToCart = async (productId) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate('/login'); // arahkan ke login jika belum login
      return;
    }

    try {
      const { data: existingCart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('product_id', productId)
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
            product_id: productId,
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
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">
          Hasil Pencarian: <span className="text-green-600">"{keyword}"</span>
        </h1>

        {loading && <p>Memuat produk...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}

        {!loading && products.length === 0 && (
          <p>Tidak ada produk yang cocok dengan pencarian.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 flex flex-col"
            >
              {/* Klik image dan nama produk menuju detail */}
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img
                  src={product.product_image || '/default-product.png'}
                  alt={product.product_name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h2 className="text-lg font-semibold mb-2">{product.product_name}</h2>
              </div>

              <p className="text-green-600 font-bold mb-2">Rp {product.price.toLocaleString('id-ID')}</p>
              <p className="text-gray-600 flex-grow">{product.description?.substring(0, 100)}...</p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                >
                  Beli Sekarang
                </button>
                <button
                  onClick={() => handleAddToCart(product.id)}
                  className="p-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition"
                  aria-label="Tambah ke keranjang"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Search;

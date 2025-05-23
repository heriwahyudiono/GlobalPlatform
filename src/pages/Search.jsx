import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar'; // pastikan path sesuai

// Fungsi untuk mendapatkan query param keyword
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Search = () => {
  const query = useQuery();
  const keyword = query.get('keyword') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!keyword.trim()) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      // Query ke Supabase dengan filter product_name ILIKE keyword
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
              <Link to={`/product/${product.id}`}>
                <img
                  src={product.product_image || '/default-product.png'}
                  alt={product.product_name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h2 className="text-lg font-semibold mb-2">{product.product_name}</h2>
              </Link>
              <p className="text-green-600 font-bold mb-2">Rp {product.price.toLocaleString('id-ID')}</p>
              <p className="text-gray-600 flex-grow">{product.description?.substring(0, 100)}...</p>
              <Link
                to={`/product/${product.id}`}
                className="mt-4 text-center bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
              >
                Detail Produk
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Search;

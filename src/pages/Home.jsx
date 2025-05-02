import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import Carousel from '../components/Carousel';
import Navbar from '../components/Navbar';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch produk elektronik dari DummyJSON
  useEffect(() => {
    fetch('https://dummyjson.com/products/category/smartphones')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal mengambil data produk');
        return res.json();
      })
      .then((data) => {
        setProducts(data.products);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center mt-10 text-xl">Loading products...</div>
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
      <div className="mt-20">
        <Carousel />
      </div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-8">Produk Elektronik</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => {
            const discount = 10;
            const discountPrice = (product.price * (1 - discount / 100)).toFixed(2);
            const rating = product.rating ?? 4;

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-full h-full object-contain p-4"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2 line-clamp-1">{product.title}</h2>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                  <div className="flex items-center mb-2">
                    {Array.from({ length: 5 }, (_, index) => (
                      <span key={index}>
                        {rating > index ? (
                          <FaStar className="text-yellow-500 w-4 h-4" />
                        ) : (
                          <FaRegStar className="text-yellow-500 w-4 h-4" />
                        )}
                      </span>
                    ))}
                    <span className="text-gray-500 text-xs ml-2">{product.stock} stok</span>
                  </div>

                  <div className="text-sm text-gray-500 mb-1">
                    {product.stock * 2} terjual
                  </div>

                  <div className="flex flex-col mb-2 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold text-lg">${discountPrice}</span>
                      <span className="text-sm text-gray-400 line-through">${product.price}</span>
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                        {discount}% OFF
                      </span>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-800 w-fit px-2 py-0.5 rounded">
                      COD Tersedia
                    </span>
                  </div>

                  <div className="flex mt-4 gap-2">
                    <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition">
                      Beli Sekarang
                    </button>
                    <button className="p-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Home;

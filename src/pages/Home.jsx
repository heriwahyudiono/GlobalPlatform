import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Trash2, Heart, MessageCircle, Share2 } from 'lucide-react';
import Carousel from '../components/Carousel';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabaseClient';
import { useUser } from '../UserContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const { userName, setUserName, userRole, setUserRole } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/');

      const { data: userData } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (userData) {
        setUserName(userData.name);
        setUserRole(userData.role);
      }
    };

    checkAuth();
  }, [navigate, setUserName, setUserRole]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, user_id, product_name, description, created_at,
        product_images (id, product_image)
      `)
      .order('created_at', { ascending: false });

    if (error) setError(error.message);
    else setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleViewProduct = async (product) => {
    const { data: { session } } = await supabase.auth.getSession();
    const viewerId = session?.user?.id;
    if (!viewerId) return navigate('/login');

    try {
      const { data: owner } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', product.user_id)
        .maybeSingle();

      if (owner && owner.id !== viewerId) {
        const { data: viewer } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', viewerId)
          .maybeSingle();

        await supabase.from('notifications').insert({
          user_id: owner.id,
          product_id: product.id,
          notif: `${viewer.name} melihat produk Anda.`,
        });
      }
    } catch (err) {
      console.error('Gagal mengirim notifikasi:', err);
    }

    navigate(`/product/${product.id}`);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Hapus produk ini?')) return;
    try {
      await supabase.from('product_images').delete().eq('product_id', productId);
      await supabase.from('products').delete().eq('id', productId);
      fetchProducts();
      setShowMenu(null);
    } catch (err) {
      console.error('Gagal menghapus:', err.message);
    }
  };

  if (loading) return <><Navbar /><div className="text-center mt-10 text-xl">Memuat produk...</div></>;
  if (error) return <><Navbar /><div className="text-center mt-10 text-red-500 text-xl">Error: {error}</div></>;

  return (
    <>
      <Navbar />
      <div className="mt-20">
        <Carousel />
      </div>
      <div className="container mx-auto px-4 py-8 mb-20">
        <h2 className="text-2xl font-bold text-center mb-8">Postingan Produk</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => {
            const mainImage = product.product_images?.[0]?.product_image || 'https://via.placeholder.com/300';

            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow relative">
                {userRole === 'admin' && (
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(showMenu === product.id ? null : product.id);
                      }}
                      className="p-1 rounded-full bg-white bg-opacity-70 hover:bg-gray-100"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                    {showMenu === product.id && (
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg py-1 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProduct(product.id);
                          }}
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Hapus
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div onClick={() => handleViewProduct(product)} className="cursor-pointer">
                  <div className="h-48 overflow-hidden">
                    <img src={mainImage} alt={product.product_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-2 line-clamp-1">{product.product_name}</h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <button className="flex items-center gap-1 text-gray-600 hover:text-red-500">
                        <Heart size={18} /> <span>Suka</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-blue-500">
                        <MessageCircle size={18} /> <span>Komentar</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-green-500">
                        <Share2 size={18} /> <span>Bagikan</span>
                      </button>
                    </div>
                  </div>
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

export default Home;

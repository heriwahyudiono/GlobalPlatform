import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabaseClient';
import { useUser } from '../UserContext';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setUserName, setUserRole } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        navigate('/');
        return;
      }

      try {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (userError) throw userError;

        if (userData) {
          setUserName(userData.name);
          setUserRole(userData.role);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    checkAuth();
  }, [navigate, setUserName, setUserRole]);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          caption,
          user_id,
          created_at,
          post_images (id, post_image)
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

      if (profileError) throw profileError;

      const profileMap = profileData.reduce((map, profile) => {
        map[profile.id] = profile.name;
        return map;
      }, {});

      const postsWithUser = postsData.map(post => ({
        ...post,
        user_name: profileMap[post.user_id] || 'Pengguna'
      }));

      setPosts(postsWithUser);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-xl">Memuat postingan...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500 text-xl">Error: {error}</div>;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 mb-20">
        <div className="flex flex-col gap-6">
          {posts.map((post) => {
            const image = post.post_images?.[0]?.post_image || 'https://via.placeholder.com/600x400';

            return (
              <div
                key={post.id}
                onClick={() => navigate(`/post/${post.id}`)}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <img src={image} alt="Post" className="w-full max-h-[500px] object-cover" />
                <div className="p-4">
                  <div className="text-sm text-gray-500 mb-1">oleh {post.user_name}</div>
                  <p className="text-gray-800 text-base whitespace-pre-line">{post.caption}</p>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="flex items-center gap-1 text-gray-600 hover:text-red-500">
                      <Heart size={18} /> <span>Suka</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 hover:text-blue-500">
                      <MessageCircle size={18} /> <span>Komentar</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 hover:text-green-500">
                      <Share2 size={18} /> <span>Bagikan</span>
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

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [images, setImages] = useState([]);
  const [owner, setOwner] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const { data, error: pErr } = await supabase
        .from('posts')
        .select('*, post_images(id, post_image)')
        .eq('id', id)
        .single();
      if (pErr) throw pErr;

      setPost(data);
      setImages(data.post_images || []);

      const { data: u, error: uErr } = await supabase
        .from('profiles')
        .select('id, name, profile_picture')
        .eq('id', data.user_id)
        .single();
      if (uErr) throw uErr;
      setOwner(u);

      fetchComments();
    } catch {
      setError('Postingan tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('id, comment, created_at, user_id, profiles:user_id(id, name, profile_picture)')
      .eq('post_id', id)
      .order('created_at', { ascending: false });
    if (!error) setComments(data);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return navigate('/login');
    setSubmitting(true);

    const { error } = await supabase.from('comments').insert([{
      user_id: session.user.id,
      post_id: id,
      comment: newComment.trim()
    }]);
    if (!error) {
      setNewComment('');
      fetchComments();
    } else {
      alert('Gagal mengirim komentar: ' + error.message);
    }
    setSubmitting(false);
  };

  if (error) return <><Navbar /><p className="text-center mt-10 text-red-600">{error}</p></>;
  if (loading || !post) return <><Navbar /><p className="text-center mt-10">Memuat...</p></>;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-2xl mb-20">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 flex items-center gap-3 border-b">
            {owner.profile_picture && (
              <img src={owner.profile_picture} alt={owner.name} className="w-10 h-10 rounded-full object-cover" />
            )}
            <div>
              <p className="font-semibold">{owner.name}</p>
              <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="space-y-4">
            {images.length > 0 ? (
              images.map(img => (
                <img key={img.id} src={img.post_image} alt="Post" className="w-full object-cover" />
              ))
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500">
                Tidak ada gambar
              </div>
            )}
          </div>

          <div className="p-4">
            <p className="text-gray-800 whitespace-pre-line">{post.caption}</p>

            <div className="flex justify-between items-center mt-4 pt-4 border-t">
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

          <div className="p-4 border-t">
            <h3 className="font-semibold mb-2">Komentar ({comments.length})</h3>
            <textarea
              className="w-full p-2 border rounded"
              rows="3"
              placeholder="Tulis komentar..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            ></textarea>
            <button
              onClick={handleAddComment}
              disabled={submitting}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
            >
              {submitting ? 'Mengirim...' : 'Kirim'}
            </button>

            <div className="mt-4 space-y-3">
              {comments.map(c => (
                <div key={c.id} className="flex items-start gap-3">
                  {c.profiles?.profile_picture && (
                    <img src={c.profiles.profile_picture} alt={c.profiles.name}
                      className="w-8 h-8 rounded-full object-cover" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{c.profiles?.name || 'Pengguna'}</p>
                    <p className="text-sm">{c.comment}</p>
                    <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default PostDetail;

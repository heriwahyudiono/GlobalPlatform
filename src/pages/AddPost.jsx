import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar'; 

const AddPost = () => {
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login'); 
        return;
      }
      setUserId(session.user.id); 
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      // 1. Insert ke tabel posts
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([{ user_id: userId, caption }])
        .select();

      if (postError) {
        setError(`Failed to add post: ${postError.message}`);
        return;
      }

      const postId = postData[0].id;

      // 2. Upload image dan insert ke post_images
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `post-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) {
          setError(`Failed to upload image: ${uploadError.message}`);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        const imageUrl = urlData.publicUrl;

        const { error: imageError } = await supabase
          .from('post_images')
          .insert([{ post_id: postId, post_image: imageUrl }]);

        if (imageError) {
          setError(`Failed to save post image: ${imageError.message}`);
          return;
        }
      }

      // Reset form
      setCaption('');
      setImageFile(null);
      setMessage('Post added successfully!');
      window.alert('Postingan berhasil ditambahkan');
    } catch (err) {
      setError('Unexpected error occurred. Please try again.');
      console.error('Unexpected error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add Post</h2>

          {error && <p className="text-red-500 mb-4 p-2 bg-red-50 rounded">{error}</p>}
          {message && <p className="text-green-500 mb-4 p-2 bg-green-50 rounded">{message}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Post Image</label>
              <div className="mt-1 flex items-center">
                <label className="cursor-pointer bg-white rounded-md border border-gray-300 p-2 w-full">
                  <span className="text-sm text-gray-600">{imageFile ? imageFile.name : 'Choose an image...'}</span>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
              {imageFile && (
                <div className="mt-2">
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Preview" 
                    className="h-32 object-contain rounded-md"
                  />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Add Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPost;

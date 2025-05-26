import { useState, useEffect } from 'react';
/* 
useState : untuk membuat state lokal fungsinya untuk menyimpan data dalam komponen
useEffect : untuk menjalankan kode tambahan setelah komponen selesai dirender 
seperti mengambil data, mengecek autentikasi, atau berinteraksi dengan API
*/
import { useNavigate } from 'react-router-dom';
/*
useNavigate : untuk navigasi
*/
import { supabase } from '../supabaseClient';

const AddProduct = () => {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      /*
      const { data: { session } } : variabel yang isinya properti yang berupa objek
      */
      if (!session) {
        navigate('/login'); 
        return;
      }
      setUserId(session.user.id); 
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // berfungsi untuk mencegah reloaad halaman 
    setMessage('');
    setError('');

    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert([{ user_id: userId, product_name: productName, description, price }])
        .select();

      if (productError) {
        setError(`Failed to add product: ${productError.message}`);
        return;
      }

      const productId = productData[0].id;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) {
          setError(`Failed to upload image: ${uploadError.message}`);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        const imageUrl = urlData.publicUrl;

        const { error: imageError } = await supabase
          .from('product_images')
          .insert([{ product_id: productId, product_image: imageUrl }]);

        if (imageError) {
          setError(`Failed to save product image: ${imageError.message}`);
          return;
        }
      }

      setProductName('');
      setDescription('');
      setPrice('');
      setImageFile(null);
      setMessage('Product added successfully!');
    } catch (err) {
      setError('Unexpected error occurred. Please try again.');
      console.error('Unexpected error:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Add Product</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {message && <p className="text-green-500 mb-4">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="product_name" className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            id="product_name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full"
          />
        </div>
        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import { v4 as uuidv4 } from 'uuid';

const Profile = () => {
  const { id: receiverId } = useParams();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profile_picture: '',
    gender: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setLoading(true);
      setError('');

      // Ambil user yang sedang login
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      // Ambil data profil berdasarkan parameter id
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, profile_picture, gender')
        .eq('id', receiverId)
        .single();

      if (error) {
        setError('Gagal memuat profil.');
        console.error('Fetch profile error:', error);
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    if (receiverId) {
      fetchUserAndProfile();
    }
  }, [receiverId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    let imageUrl = profile.profile_picture;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${currentUserId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        alert('Gagal mengunggah gambar');
        console.error('Upload error:', uploadError);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ ...profile, profile_picture: imageUrl })
      .eq('id', currentUserId);

    if (error) {
      alert('Gagal memperbarui profil.');
      console.error('Update profile error:', error);
    } else {
      alert('Profil berhasil diperbarui');
      setEditing(false);
      setProfile((prev) => ({ ...prev, profile_picture: imageUrl }));
      setImageFile(null);
    }
  };

  const handleSendMessage = async () => {
    if (!currentUserId || !receiverId) return;

    // Cek apakah sudah ada chat antara kedua user
    const { data: existingChats, error: fetchError } = await supabase
      .from('chats')
      .select('chat_id')
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUserId})`
      )
      .limit(1);

    if (fetchError) {
      console.error('Error fetching existing chats:', fetchError);
      return;
    }

    // Jika chat sudah ada, gunakan chat_id yang sudah ada
    if (existingChats && existingChats.length > 0) {
      navigate(`/chat/${existingChats[0].chat_id}`);
      return;
    }

    // Jika belum ada, buat chat baru
    const chatId = uuidv4();

    const { error } = await supabase.from('chats').insert({
      chat_id: chatId,
      sender_id: currentUserId,
      receiver_id: receiverId,
      message: '👋', // pesan awal default
    });

    if (error) {
      console.error('Error creating chat:', error);
      return;
    }

    navigate(`/chat/${chatId}`);
  };

  if (loading) return <div className="text-center py-10">Memuat profil...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto mt-10 bg-white shadow-md rounded-2xl p-6">
        <div className="flex flex-col items-center text-center">
          <img
            src={
              imageFile
                ? URL.createObjectURL(imageFile)
                : profile.profile_picture || 'https://via.placeholder.com/150'
            }
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-green-500"
          />

          {editing && currentUserId === receiverId ? (
            <div className="w-full mt-4 space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border p-2 rounded-lg"
              />
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Nama"
                className="w-full border p-2 rounded-lg"
              />
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border p-2 rounded-lg"
              />
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="w-full border p-2 rounded-lg"
              >
                <option value="">Jenis Kelamin</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>

              <div className="flex gap-4 justify-center mt-4">
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setImageFile(null);
                  }}
                  className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="mt-4 text-2xl font-bold text-gray-800">
                {profile.name || 'Tidak diketahui'}
              </h2>
              <p className="text-gray-600">{profile.email}</p>

              {currentUserId === receiverId ? (
                <button
                  onClick={() => setEditing(true)}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Edit Profil
                </button>
              ) : (
                <button
                  onClick={handleSendMessage}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Kirim Pesan
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
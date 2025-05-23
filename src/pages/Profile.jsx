import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar'; // pastikan path-nya sesuai struktur project kamu

const Profile = () => {
  const [userData, setUserData] = useState({ name: '', profile_picture: '' });
  const [email, setEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.error('Gagal mengambil user:', error?.message || 'Belum login');
        setLoading(false);
        return;
      }

      setEmail(user.email);
      setNewEmail(user.email);

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('name, profile_picture')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Gagal mengambil profil:', profileError.message);
      } else {
        setUserData(data);
        setNewName(data.name);
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    let profilePictureUrl = userData.profile_picture;

    if (newProfilePicture) {
      const fileExt = newProfilePicture.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, newProfilePicture, { upsert: true });

      if (error) {
        alert('Gagal upload foto profil');
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      profilePictureUrl = publicUrlData.publicUrl;
    }

    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ name: newName, profile_picture: profilePictureUrl })
      .eq('id', user.id);

    if (updateProfileError) {
      alert('Gagal memperbarui profil');
      return;
    }

    if (newEmail !== email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (emailError) {
        alert('Gagal memperbarui email: ' + emailError.message);
        return;
      }
    }

    setUserData({ name: newName, profile_picture: profilePictureUrl });
    setEmail(newEmail);
    alert('Profil berhasil diperbarui');
  };

  const getAvatar = () => {
    if (userData.profile_picture) {
      return <img src={userData.profile_picture} alt="Profile" className="w-24 h-24 rounded-full object-cover" />;
    }
    const initials = getAvatarInitials(userData.name);
    return (
      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
        {initials}
      </div>
    );
  };

  const getAvatarInitials = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    return parts.length === 1
      ? parts[0].charAt(0).toUpperCase()
      : parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center mt-20"><p>Loading profile...</p></div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg max-w-lg mx-auto p-8">
          <div className="flex items-center justify-center mb-6">{getAvatar()}</div>
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-semibold text-gray-800">{userData.name}</h2>
            <p className="text-sm text-gray-500">{email}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Foto Profil</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewProfilePicture(e.target.files[0])}
                className="w-full mt-1"
              />
            </div>

            <button
              onClick={handleUpdateProfile}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;

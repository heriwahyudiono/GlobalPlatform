import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { id } = useParams(); // ambil id dari URL
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: '', profile_picture: '' });
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getUser();
      setCurrentUserId(sessionData?.user?.id || null);

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('name, profile_picture')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Gagal ambil profil:', error.message);
      } else {
        setUserData(profileData);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  const getAvatar = () => {
    if (userData.profile_picture) {
      return (
        <img
          src={userData.profile_picture}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover"
        />
      );
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

  const handleChat = async () => {
    if (!currentUserId) return;

    const participants = [currentUserId, id].sort(); // urutkan ID untuk konsistensi
    const chatId = `${participants[0]}_${participants[1]}`;

    navigate(`/chat/${chatId}`);
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
          </div>

          {/* Tombol Kirim Pesan */}
          {currentUserId && currentUserId !== id && (
            <button
              onClick={handleChat}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Kirim Pesan
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;

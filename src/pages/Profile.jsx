import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Profile = () => {
  const { id } = useParams(); // Ambil ID dari URL
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, profile_picture, gender') // Tambahkan gender
        .eq('id', id)
        .single();

      if (error) {
        setError('Gagal memuat profil.');
        console.error('Fetch profile error:', error);
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Memuat profil...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-md rounded-2xl p-6">
      <div className="flex flex-col items-center text-center">
        {/* Foto profil */}
        <img
          src={profile?.profile_picture || 'https://via.placeholder.com/150'}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-green-500"
        />
        <h2 className="mt-4 text-2xl font-bold text-gray-800">{profile?.name || 'Tidak diketahui'}</h2>
        <p className="text-gray-600">{profile?.email}</p>
      </div>
    </div>
  );
};

export default Profile;

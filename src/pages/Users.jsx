import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');

      try {
        // Ambil semua user kecuali user yang sedang login
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, profile_picture, gender, created_at');

        if (error) {
          throw error;
        }

        // Filter out current user
        const filteredUsers = data.filter(user => user.id !== currentUserId);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Gagal memuat daftar pengguna');
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchUsers();
    }
  }, [currentUserId]);

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) return <div className="text-center py-10">Memuat pengguna...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10 bg-white shadow-md rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-6">Users</h1>

        {/* Users List */}
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Tidak ada pengguna lain
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
              >
                <img
                  src={user.profile_picture || 'https://via.placeholder.com/150'}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="text-xs text-gray-500">
                  Joined at: {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Users;
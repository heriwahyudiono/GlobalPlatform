import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error getting user:', userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        console.warn('No user logged in');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')    
        .select('name') 
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile data:', error.message);
      } else {
        setUserData(data);
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-20">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center mt-20">
        <p>User data not found.</p>
      </div>
    );
  }

  const getAvatarInitials = (fullName) => {
    if (!fullName) return '';
    const nameParts = fullName.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return `${nameParts[0].charAt(0).toUpperCase()}${nameParts[1].charAt(0).toUpperCase()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg max-w-lg mx-auto p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {getAvatarInitials(userData.name)}
          </div>
        </div>

        <div className="mb-4 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">{userData.name}</h2>
        </div>
      </div>
    </div>
  );
};

export default Profile;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Inbox = () => {
  const [chats, setChats] = useState([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchChats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user.id);

      const { data, error } = await supabase
        .from('chats')
        .select('chat_id, sender_id, message, created_at, profiles!chats_sender_id_fkey(name, profile_picture)')
        .or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!error) {
        const uniqueChats = Array.from(
          new Map(data.map(chat => [chat.chat_id, chat])).values()
        );
        setChats(uniqueChats);
      }
    };

    fetchChats();
  }, []);

  return (
    <div className="max-w-xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Inbox</h1>
      {chats.map(chat => (
        <Link key={chat.chat_id} to={`/chat/${chat.chat_id}`}>
          <div className="p-4 border-b hover:bg-gray-100">
            <div className="flex items-center gap-3">
              <img
                src={chat.profiles?.profile_picture || 'https://via.placeholder.com/40'}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-medium">{chat.profiles?.name || 'Unknown User'}</div>
                <div className="text-sm text-gray-600">{chat.message}</div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Inbox;

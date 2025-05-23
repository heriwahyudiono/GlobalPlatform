import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Chat = () => {
  const { chat_id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user.id);

      const { data } = await supabase
        .from('chats')
        .select('*, profiles!chats_sender_id_fkey(name, profile_picture)')
        .eq('chat_id', chat_id)
        .order('created_at', { ascending: true });

      setMessages(data || []);
    };

    init();

    const channel = supabase
      .channel('realtime:chats')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chats',
        filter: `chat_id=eq.${chat_id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat_id]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    await supabase.from('chats').insert({
      chat_id,
      sender_id: userId,
      message: newMsg
    });

    setNewMsg('');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-xl font-semibold mb-4">Chat Room</div>
      <div className="space-y-2 mb-4 h-[400px] overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-2 rounded-md ${msg.sender_id === userId ? 'bg-green-200' : 'bg-gray-200'}`}>
              {msg.message}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Tulis pesan..."
          className="flex-1 p-2 border rounded"
        />
        <button onClick={sendMessage} className="bg-green-500 text-white px-4 py-2 rounded">
          Kirim
        </button>
      </div>
    </div>
  );
};

export default Chat;

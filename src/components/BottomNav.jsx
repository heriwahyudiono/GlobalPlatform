import { useState, useEffect } from 'react';
import { Home, Users, MessageSquare, Bell, ShoppingBag, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userId, setUserId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Ambil user ID dari session Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  // Cek pesan yang belum dibaca & pasang listener realtime
  useEffect(() => {
    if (!userId) return;

    const checkUnread = async () => {
      const { count, error } = await supabase
        .from('chats')
        .select('*', { count: 'exact' })
        .eq('receiver_id', userId)
        .eq('is_read', false);

      if (!error) setUnreadCount(count);
    };

    checkUnread();

    const subscription = supabase
      .channel('unread_messages') // Nama channel sesuai permintaan
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `receiver_id=eq.${userId}`
        },
        () => {
          checkUnread(); // Update jumlah jika ada perubahan
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  const menuItems = [
    { label: 'Home', icon: <Home size={20} />, path: '/home' },
    { label: 'Friends', icon: <Users size={20} />, path: '/friends' },
    {
      label: 'Chats',
      icon: (
        <div className="relative">
          <MessageSquare size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] h-4 w-4 flex items-center justify-center rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      ),
      path: '/inbox'
    },
    { label: 'Notifications', icon: <Bell size={20} />, path: '/notifications' },
    { label: 'Shop', icon: <ShoppingBag size={20} />, path: '/shop' },
    { label: 'Menu', icon: <Menu size={20} />, path: '/menu' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md z-50">
      <div className="flex justify-around items-center py-2">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={index}
              onClick={() => item.path && navigate(item.path)}
              className={`flex flex-col items-center text-xs px-1 ${
                isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-500'
              }`}
            >
              {item.icon}
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

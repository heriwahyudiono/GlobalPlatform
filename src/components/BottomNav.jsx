import React from 'react';
import { Home, Users, MessageSquare, Bell, Store, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Home', icon: <Home size={20} />, path: '/' },
    { label: 'Friends', icon: <Users size={20} />, path: '/friends' },
    { label: 'Chats', icon: <MessageSquare size={20} />, path: '/inbox' },
    { label: 'Notifications', icon: <Bell size={20} />, path: '/notifications' },
    { label: 'Store', icon: <Store size={20} />, path: '/store' },
    { label: 'Menu', icon: <Menu size={20} />, path: '/menu' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md z-50">
      <div className="flex justify-around items-center py-2">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
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

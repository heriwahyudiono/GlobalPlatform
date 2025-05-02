import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Bell, Mail, Flag } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo dan Negara di kiri */}
        <div className="flex flex-col flex-shrink-0">
          <Link to="/" className="text-green-600 font-bold text-2xl">
            GlobalMarket
          </Link>
          <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
            <Flag className="w-4 h-4 text-green-500" />
            <span>Indonesia</span>
          </div>
        </div>

        {/* Search tengah */}
        <div className="flex-grow mx-4 relative max-w-xl">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Cari produk..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-400 transition"
          />
        </div>

        {/* Icon kanan */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          <Link to="/inbox" className="text-gray-600 hover:text-green-600">
            <Mail className="w-6 h-6" />
          </Link>
          <Link to="/notifications" className="text-gray-600 hover:text-green-600">
            <Bell className="w-6 h-6" />
          </Link>
          <Link to="/cart" className="text-gray-600 hover:text-green-600">
            <ShoppingCart className="w-6 h-6" />
          </Link>

          {/* Avatar dan Nama statis */}
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full hover:bg-green-100 transition">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-sm text-gray-700 font-medium">Hi, Heri</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Clock } from 'lucide-react';
import { useUser } from '../UserContext';
import { supabase } from '../supabaseClient';

const Navbar = () => {
  const { userName } = useUser();
  const [userId, setUserId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchKeyword.trim() !== '') {
      navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  return (
    <nav className="bg-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="hidden md:flex flex-col flex-shrink-0">
          <Link to="/home" className="text-green-600 font-bold text-2xl">
            GlobalPlatform
          </Link>
        </div>

        {/* Search bar */}
        <div className="flex-grow mx-0 md:mx-4 relative max-w-xl">
          <div className="flex items-center">
            <div className="relative w-full mx-4">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </span>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Cari produk..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          <Link to="/transactions" className="text-gray-600 hover:text-green-600">
            <Clock className="w-6 h-6" />
          </Link>

          <Link to="/carts" className="text-gray-600 hover:text-green-600">
            <ShoppingCart className="w-6 h-6" />
          </Link>

          {userName && (
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full hover:bg-green-100 transition cursor-pointer"
                onClick={() => setDropdownOpen(prev => !prev)}
              >
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm text-gray-700 font-medium">Hi, {userName}</span>
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                  {userId && (
                    <Link
                      to={`/profile/${userId}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = '/';
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

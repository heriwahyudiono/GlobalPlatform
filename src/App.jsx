import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useUser } from './UserContext'; 
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AddProduct from './pages/AddProduct';
import Carts from './pages/Carts';
import Search from './pages/Search';
import Inbox from './pages/Inbox';
import Chat from './pages/Chat';
import ProductDetail from './pages/ProductDetail';

const App = () => {
  const { setUserName } = useUser();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        if (profile && !error) {
          setUserName(profile.name);
        }
      }
    };

    fetchUserProfile();
  }, [setUserName]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/home" element={<Home />} />
          <Route path="/carts" element={<Carts />} />
          <Route path="/search" element={<Search />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/chat/:chat_id" element={<Chat />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;


import { BrowserRouter, Route, Routes } from 'react-router-dom'; // import library react-router-dom
import Home from './pages/Home'; // import halaman Home 
import Login from './pages/Login'; // import halaman Login
import Register from './pages/Register'; // import halaman Register

// Fungsi dari library react-router-dom untuk routing/pemindahan halaman
// import AppRoutes from './routes/AppRoutes'; // import AppRoutes.jsx dari folder routes

/* ada berbagai jenis functional components yang sering di pakai:
- function declaration
- arrow function
*/

// ini pakai arrow function
const App = () => {
  return (
    <BrowserRouter>
     
    <Routes>
      {/* routingnya ada di sini*/}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
    </BrowserRouter>
  );
};

// ini untuk ekspor functionnya
export default App;

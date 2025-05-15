import React from 'react'; // import library react
import { BrowserRouter } from 'react-router-dom'; // import library react-router-dom
// Fungsi dari library react-router-dom untuk routing/pemindahan halaman
import AppRoutes from './routes/AppRoutes'; // import AppRoutes.jsx dari folder routes

/* ada berbagai jenis functional components yang sering di pakai:
- function declaration
- arrow function
*/

// ini pakai arrow function
const App = () => {
  return (
    <BrowserRouter>
      {/* Memanggil AppRoutes */}
      <AppRoutes />
    </BrowserRouter>
  );
};

// ini untuk ekspor functionnya
export default App;

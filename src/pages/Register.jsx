// Import React hook dan dependensi yang dibutuhkan
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Supabase client
import { FcGoogle } from 'react-icons/fc'; // Ikon Google

// Komponen utama Register
const Register = () => {
  // State untuk menyimpan input form dan error
  const [name, setName] = useState(''); // Nama pengguna
  const [email, setEmail] = useState(''); // Email pengguna
  const [password, setPassword] = useState(''); // Password pengguna
  const [errorMessage, setErrorMessage] = useState(''); // Pesan error
  const navigate = useNavigate(); // Untuk mengarahkan pengguna ke halaman lain

  // Fungsi untuk menangani submit form
  const handleRegister = async (e) => {
    e.preventDefault(); // Mencegah reload halaman
    setErrorMessage(''); // Reset pesan error

    try {
      // Registrasi user ke Supabase
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        // Jika gagal registrasi, tampilkan pesan error
        setErrorMessage(error.message);
        return;
      }

      // Jika berhasil, tambahkan data ke tabel `profiles`
      if (data?.user) {
        const { error: insertError } = await supabase.from('profiles').insert([
          {
            id: data.user.id, // Gunakan ID dari user Supabase
            name, // Simpan nama yang dimasukkan
          },
        ]);

        if (insertError) {
          // Jika gagal menyimpan ke tabel profiles
          setErrorMessage(insertError.message);
          return;
        }

        // Arahkan ke halaman /home setelah sukses
        navigate('/home');
      }
    } catch (err) {
      // Tangani error tidak terduga
      setErrorMessage('Unexpected error occurred. Please try again later.');
      console.error('Register error:', err);
    }
  };

  // Tampilan form registrasi
  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Kiri: branding, hanya muncul di layar besar */}
      <div className="hidden lg:flex w-1/2 bg-green-600 items-center justify-center">
        <div className="text-center px-8">
          <img src="" alt="GlobalMarket Logo" className="mx-auto w-64 h-64 object-contain" />
          <h1 className="text-white text-4xl font-bold">GlobalMarket</h1>
          <p className="text-white text-lg">Menghubungkan Seluruh Dunia!</p>
        </div>
      </div>

      {/* Kanan: form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 py-12">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Register</h2>
        </div>

        <div className="mt-8 max-w-md w-full mx-auto">
          <div className="bg-white py-10 px-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
            {/* Form register */}
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Input nama */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-400 transition"
                  />
                </div>
              </div>

              {/* Input email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-400 transition"
                  />
                </div>
              </div>

              {/* Input password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-400 transition"
                  />
                </div>
              </div>

              {/* Tombol submit */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                >
                  Register
                </button>
              </div>

              {/* Garis pemisah "atau" */}
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-400">atau</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Tombol daftar dengan Google (belum aktif) */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                <FcGoogle className="w-5 h-5" />
                Daftar dengan Google
              </button>
            </form>

            {/* Tampilkan error jika ada */}
            {errorMessage && (
              <p className="text-red-500 text-sm mt-4 text-center">{errorMessage}</p>
            )}

            {/* Link ke halaman login */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <Link to="/" className="font-medium text-green-600 hover:text-green-500">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Ekspor komponen Register
export default Register;

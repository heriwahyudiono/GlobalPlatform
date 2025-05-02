import React from 'react';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

const Register = () => {
  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      <div className="hidden lg:flex w-1/2 bg-green-600 items-center justify-center">
        <div className="text-center px-8">
          <img src="" alt="GlobalMarket Logo" className="mx-auto w-64 h-64 object-contain" />
          <h1 className="text-white text-4xl font-bold">GlobalMarket</h1>
          <p className="text-white text-lg">Pusat Perdagangan Dunia!</p>
        </div>
      </div>

      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 py-12">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Register</h2>
        </div>

        <div className="mt-8 max-w-md w-full mx-auto">
          <div className="bg-white py-10 px-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-400 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-400 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-400 transition"
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                >
                  Register
                </button>
              </div>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-400">atau</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                <FcGoogle className="w-5 h-5" />
                Daftar dengan Google
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
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

export default Register;

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "Belanja Hemat, Barang Berkualitas!",
    description: "Diskon hingga 70% hanya minggu ini!",
  },
  {
    id: 2,
    title: "Temukan Produk Favoritmu!",
    description: "Ribuan produk pilihan tersedia untukmu.",
  },
  {
    id: 3,
    title: "Pengiriman Cepat & Aman",
    description: "Belanja nyaman dari rumah tanpa khawatir.",
  },
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fungsi untuk slide ke previous
  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  // Fungsi untuk slide ke next
  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Auto-slide setiap 5 detik
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();  // Bergeser otomatis
    }, 5000); // Ubah setiap 5 detik (5000ms)

    return () => clearInterval(interval);  // Bersihkan interval saat komponen dibersihkan
  }, []);

  return (
    <div className="container mx-auto px-4 mt-6">
      <div className="relative w-full h-64 bg-sky-500 overflow-hidden rounded-lg shadow-md">
        {/* Konten Slide */}
        <div className="flex items-center justify-center h-full text-center text-white px-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{slides[currentIndex].title}</h2>
            <p className="text-lg">{slides[currentIndex].description}</p>
          </div>
        </div>

        {/* Tombol Navigasi */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 p-2 rounded-full text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 p-2 rounded-full text-white"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Carousel;

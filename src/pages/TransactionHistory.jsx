import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import {
  CheckCircle,
  Clock,
  XCircle,
  HelpCircle
} from 'lucide-react';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('Gagal mendapatkan data user.');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            products (
              product_name,
              description,
              product_images (
                product_image
              )
            )
          `)
          .eq('user_id', user.id)
          .order('transaction_time', { ascending: false });

        if (error) throw error;

        const formatted = data.map(tx => ({
          ...tx,
          product_image: tx.products?.product_images?.[0]?.product_image || 'https://via.placeholder.com/150'
        }));

        setTransactions(formatted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);

  const getStatusInfo = (status) => {
    const lower = status?.toLowerCase();
    if (lower === 'settlement' || lower === 'capture') {
      return { text: 'Berhasil', icon: <CheckCircle className="text-green-600 w-5 h-5" />, color: 'text-green-600' };
    }
    if (lower === 'pending') {
      return { text: 'Menunggu', icon: <Clock className="text-yellow-500 w-5 h-5" />, color: 'text-yellow-600' };
    }
    if (lower === 'cancel' || lower === 'deny' || lower === 'expire') {
      return { text: 'Gagal', icon: <XCircle className="text-red-500 w-5 h-5" />, color: 'text-red-600' };
    }
    return { text: status || 'Tidak Diketahui', icon: <HelpCircle className="text-gray-500 w-5 h-5" />, color: 'text-gray-600' };
  };

  if (loading) return <><Navbar /><div className="text-center mt-10">Memuat riwayat transaksi...</div></>;

  if (error) return <><Navbar /><div className="text-center mt-10 text-red-600">Error: {error}</div></>;

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10 mt-20">
        <h1 className="text-3xl font-bold mb-6 text-center">Riwayat Transaksi</h1>

        {transactions.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada transaksi.</p>
        ) : (
          <div className="space-y-6">
            {transactions.map(tx => {
              const statusInfo = getStatusInfo(tx.transaction_status);
              return (
                <div key={tx.id} className="bg-white rounded-xl shadow-md p-5 flex flex-col sm:flex-row gap-4 border hover:shadow-lg transition">
                  <img
                    src={tx.product_image}
                    alt={tx.products?.product_name}
                    className="w-24 h-24 object-contain rounded-md border"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h2 className="text-lg font-semibold line-clamp-1">{tx.products?.product_name}</h2>
                        <p className="text-gray-600 text-sm line-clamp-2">{tx.products?.description}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-green-700 font-bold text-base">{formatCurrency(tx.gross_amount)}</p>
                        <div className="flex items-center justify-end gap-1 text-sm">
                          {statusInfo.icon}
                          <span className={statusInfo.color}>{statusInfo.text}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>Qty: {tx.quantity}</span>
                      <span>{new Date(tx.transaction_time).toLocaleString('id-ID')}</span>
                    </div>

                    <details className="mt-2 text-sm">
                      <summary className="cursor-pointer text-blue-600 hover:underline">Lihat Detail</summary>
                      <div className="bg-gray-100 mt-2 rounded p-2 overflow-auto max-h-64">
                        <pre className="text-xs">{JSON.stringify(tx.payment_data, null, 2)}</pre>
                      </div>
                    </details>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default TransactionHistory;

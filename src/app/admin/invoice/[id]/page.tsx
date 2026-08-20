"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface InvoiceData {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  price: number;
  status: string;
  invoiceNumber: string;
  notes: string | null;
  createdAt: string;
  room: { name: string };
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function calculateNights(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reservations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setInvoice(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl mb-2">😕</p>
        <p className="text-gray-500">Invoice tidak ditemukan</p>
        <Link href="/admin/reservations" className="text-gold hover:underline text-sm mt-2 inline-block">
          ← Kembali
        </Link>
      </div>
    );
  }

  const nights = calculateNights(invoice.checkIn, invoice.checkOut);
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Actions (hidden when printing) */}
      <div className="flex items-center gap-4 mb-6 no-print">
        <Link href={`/admin/reservations/${id}`} className="text-gray-400 hover:text-gold">
          ←
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
          <p className="text-sm text-gray-400 font-mono">{invoice.invoiceNumber}</p>
        </div>
        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-gold text-white font-semibold rounded-xl hover:bg-gold-dark transition-all"
        >
          🖨️ Cetak Invoice
        </button>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-2xl mx-auto print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-6 mb-6">
          <h2 className="text-2xl font-bold text-[#1a2744]">🏢 DELFT APARTMENT</h2>
          <p className="text-gray-400 text-sm mt-1">Kawasan CPI Makassar</p>
          <p className="text-gray-400 text-sm">Telp: 0811-4128-05</p>
        </div>

        {/* Invoice Info */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Invoice</p>
            <p className="font-mono font-bold text-lg text-gray-900">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Tanggal</p>
            <p className="text-sm text-gray-700">{today}</p>
          </div>
        </div>

        {/* Guest Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Tamu</p>
          <p className="font-semibold text-gray-900">{invoice.guestName}</p>
          <p className="text-sm text-gray-500">Kamar: {invoice.room.name}</p>
        </div>

        {/* Reservation Details */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-semibold">Deskripsi</th>
              <th className="text-right py-2 text-gray-500 font-semibold">Detail</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 text-gray-700">Check-in</td>
              <td className="py-3 text-right text-gray-900">{formatDate(invoice.checkIn)}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 text-gray-700">Check-out</td>
              <td className="py-3 text-right text-gray-900">{formatDate(invoice.checkOut)}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 text-gray-700">Durasi</td>
              <td className="py-3 text-right text-gray-900">{nights} malam</td>
            </tr>
          </tbody>
        </table>

        {/* Total */}
        <div className="bg-[#1a2744] rounded-xl p-5 text-white">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Pembayaran</span>
            <span className="text-2xl font-bold">{formatPrice(invoice.price)}</span>
          </div>
          <div className="flex justify-between items-center mt-2 text-white/60 text-sm">
            <span>Status</span>
            <span className="font-semibold text-green-300">✅ LUNAS</span>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
            <p className="text-xs text-yellow-600 uppercase tracking-wider mb-1">Catatan</p>
            <p className="text-sm text-yellow-800">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>Invoice ini dicetak secara otomatis oleh sistem DELFT APARTMENT.</p>
          <p className="mt-1">Terima kasih atas kunjungan Anda! 🙏</p>
        </div>
      </div>
    </div>
  );
}

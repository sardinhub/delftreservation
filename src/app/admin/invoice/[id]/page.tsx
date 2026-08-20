"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface InvoiceData {
  id: string;
  guestName: string;
  phone: string | null;
  roomType: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  price: number;
  status: string;
  dpAmount: number;
  invoiceNumber: string;
  notes: string | null;
  createdAt: string;
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

function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateNights(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const watermarkConfig: Record<string, { text: string; bgColor: string; textColor: string }> = {
  menunggu_pembayaran: { text: "RESERVASI", bgColor: "bg-blue-50", textColor: "text-blue-600" },
  dp: { text: "DOWN PAYMENT", bgColor: "bg-amber-50", textColor: "text-amber-600" },
  lunas: { text: "LUNAS", bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
};

const statusBadgeConfig: Record<string, { label: string; color: string }> = {
  menunggu_pembayaran: { label: "MENUNGGU PEMBAYARAN", color: "bg-blue-100 text-blue-700" },
  dp: { label: "DOWN PAYMENT", color: "bg-amber-100 text-amber-700" },
  lunas: { label: "LUNAS", color: "bg-emerald-100 text-emerald-700" },
};

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
  const today = formatDate(invoice.createdAt);
  const watermark = watermarkConfig[invoice.status] || watermarkConfig.menunggu_pembayaran;
  const badge = statusBadgeConfig[invoice.status] || statusBadgeConfig.menunggu_pembayaran;
  const isDP = invoice.status === "dp";
  const dpAmount = invoice.dpAmount || 0;
  const remainingBalance = invoice.price - dpAmount;

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* Toolbar - hidden on print */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 no-print">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href={`/admin/reservations/${id}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gold text-sm font-medium"
          >
            <span>←</span>
            <span>Kembali</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono hidden sm:inline">{invoice.invoiceNumber}</span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a2744] text-white rounded-lg hover:bg-[#16213e] transition-colors text-sm font-medium active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Cetak
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="max-w-3xl mx-auto py-6 px-4 print:py-0 print:px-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-none print:rounded-none">

          {/* === HEADER === */}
          <div className="border-b border-gray-200">
            <div className="px-6 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Company Info */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#1a2744] rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">D</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-[#1a2744] tracking-tight">DELFT APARTMENT</h1>
                    <p className="text-[11px] text-gray-400 -mt-0.5">Kawasan CPI Makassar</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                  <p>Telp: 0811-4128-05</p>
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="sm:text-right">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${badge.color} mb-3`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${invoice.status === "lunas" ? "bg-emerald-500" : invoice.status === "dp" ? "bg-amber-500" : "bg-blue-500"}`} />
                  {badge.label}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Invoice</p>
                  <p className="text-base font-bold text-gray-900 font-mono">{invoice.invoiceNumber}</p>
                </div>
                <div className="mt-2">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Tanggal</p>
                  <p className="text-xs text-gray-600">{today}</p>
                </div>
              </div>
            </div>
          </div>

          {/* === BILL TO + ROOM INFO === */}
          <div className="px-6 sm:px-8 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Bill To */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-semibold">Bill To</p>
              <p className="text-sm font-bold text-gray-900">{invoice.guestName}</p>
              {invoice.phone && (
                <p className="text-xs text-gray-500 mt-1">Telp: {invoice.phone}</p>
              )}
            </div>

            {/* Room Info */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-semibold">Kamar</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold">
                  {invoice.roomType}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-600">Room {invoice.roomNumber}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                {formatDateShort(invoice.checkIn)} → {formatDateShort(invoice.checkOut)}
                <span className="text-gray-400 ml-1">({nights} {nights === 1 ? "malam" : "malam"})</span>
              </p>
            </div>
          </div>

          {/* === LINE ITEMS TABLE === */}
          <div className="px-6 sm:px-8">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-t border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Deskripsi</th>
                  <th className="text-center py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Qty</th>
                  <th className="text-right py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Harga</th>
                  <th className="text-right py-2.5 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3">
                    <p className="font-medium text-gray-900">Sewa Kamar {invoice.roomType}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Room {invoice.roomNumber}</p>
                  </td>
                  <td className="py-3 text-center text-gray-600">{nights}</td>
                  <td className="py-3 text-right text-gray-600">{formatPrice(invoice.price / nights)}</td>
                  <td className="py-3 text-right font-semibold text-gray-900">{formatPrice(invoice.price)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* === TOTALS === */}
          <div className="px-6 sm:px-8 py-5">
            <div className="sm:ml-auto sm:w-72">
              <div className="space-y-2">
                {/* Subtotal */}
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(invoice.price)}</span>
                </div>

                {/* DP Payment (if applicable) */}
                {isDP && dpAmount > 0 && (
                  <>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-amber-600">DP Dibayar</span>
                      <span className="text-amber-600 font-medium">-{formatPrice(dpAmount)}</span>
                    </div>
                    <div className="border-t border-dashed border-gray-300 pt-2">
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Sisa Pembayaran</span>
                        <span className="text-base font-bold text-gray-900">{formatPrice(remainingBalance)}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Grand Total */}
                {!isDP && (
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Total</span>
                      <span className="text-lg font-bold text-[#1a2744]">{formatPrice(invoice.price)}</span>
                    </div>
                  </div>
                )}

                {isDP && (
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Yang Harus Dibayar</span>
                      <span className="text-lg font-bold text-[#1a2744]">{formatPrice(remainingBalance)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* === NOTES === */}
          {invoice.notes && (
            <div className="px-6 sm:px-8 pb-5">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1 font-semibold">Catatan</p>
                <p className="text-xs text-gray-600">{invoice.notes}</p>
              </div>
            </div>
          )}

          {/* === PAYMENT STATUS BANNER === */}
          <div className={`mx-6 sm:mx-8 mb-6 rounded-lg p-3 flex items-center gap-3 ${watermark.bgColor} border ${invoice.status === "lunas" ? "border-emerald-200" : invoice.status === "dp" ? "border-amber-200" : "border-blue-200"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
              invoice.status === "lunas" ? "bg-emerald-100" : invoice.status === "dp" ? "bg-amber-100" : "bg-blue-100"
            }`}>
              {invoice.status === "lunas" ? "✅" : invoice.status === "dp" ? "⏳" : "📋"}
            </div>
            <div>
              <p className={`text-xs font-bold ${watermark.textColor}`}>{watermark.text}</p>
              {isDP && (
                <p className="text-[11px] text-gray-500 mt-0.5">
                  DP: {formatPrice(dpAmount)} · Sisa: {formatPrice(remainingBalance)}
                </p>
              )}
            </div>
          </div>

          {/* === FOOTER === */}
          <div className="border-t border-gray-200 px-6 sm:px-8 py-4 bg-gray-50/80">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-[10px] text-gray-400">
                Invoice ini dicetak secara otomatis oleh sistem DELFT APARTMENT
              </p>
              <p className="text-[10px] text-gray-400">
                Terima kasih atas kunjungan Anda 🙏
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

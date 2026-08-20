"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";

interface Reservation {
  id: string;
  guestName: string;
  guestNik: string;
  guestPhone: string;
  guestEmail: string | null;
  checkIn: string;
  checkOut: string;
  totalNights: number;
  totalPrice: number;
  status: string;
  accessCode: string | null;
  invoiceNumber: string | null;
  notes: string | null;
  createdAt: string;
  room: { id: string; name: string; floor: number; price: number };
  payment: {
    id: string;
    amount: number;
    proofImage: string;
    bankName: string | null;
    accountName: string | null;
    verifiedByAdmin: boolean;
  } | null;
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
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const statusConfig: Record<string, { label: string; badge: string; description: string; icon: string }> = {
  pending_approval: {
    label: "Menunggu Persetujuan",
    badge: "badge-pending",
    description: "Reservasi Anda sedang ditinjau oleh admin. Silakan tunggu konfirmasi.",
    icon: "⏳",
  },
  approved: {
    label: "Disetujui",
    badge: "badge-approved",
    description: "Reservasi telah disetujui! Silakan lakukan pembayaran sesuai invoice di bawah.",
    icon: "✅",
  },
  rejected: {
    label: "Ditolak",
    badge: "badge-rejected",
    description: "Reservasi ditolak oleh admin. Silakan hubungi admin untuk informasi lebih lanjut.",
    icon: "❌",
  },
  invoice_issued: {
    label: "Invoice Diterbitkan",
    badge: "badge-invoice",
    description: "Invoice telah diterbitkan. Silakan lakukan pembayaran.",
    icon: "📄",
  },
  paid: {
    label: "Pembayaran Diterima",
    badge: "badge-paid",
    description: "Bukti pembayaran sedang diverifikasi oleh admin.",
    icon: "💰",
  },
  confirmed: {
    label: "Terkonfirmasi",
    badge: "badge-confirmed",
    description: "Reservasi terkonfirmasi! Gunakan kode akses di bawah untuk check-in.",
    icon: "🎉",
  },
  cancelled: {
    label: "Dibatalkan",
    badge: "badge-cancelled",
    description: "Reservasi ini telah dibatalkan.",
    icon: "🚫",
  },
};

export default function BookingStatusPage() {
  const params = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [phone, setPhone] = useState("");
  const [lookupMode, setLookupMode] = useState(true);
  const [lookupError, setLookupError] = useState("");

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    bankName: "",
    accountName: "",
    amount: "",
    transferDate: "",
  });

  const fetchReservation = async (id: string) => {
    try {
      const res = await fetch(`/api/reservations?id=${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setReservation(data);
      setLookupMode(false);
    } catch {
      setLookupError("Reservasi tidak ditemukan. Pastikan ID reservasi benar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = params.id as string;
    if (id && id !== "lookup") {
      fetchReservation(id);
    } else {
      setLoading(false);
    }
  }, [params.id]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/reservations?guestPhone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setReservation(data[0]);
        setLookupMode(false);
      } else {
        setLookupError("Tidak ditemukan reservasi dengan nomor tersebut.");
      }
    } catch {
      setLookupError("Terjadi kesalahan saat mencari reservasi.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation) return;
    setUploadError("");
    setUploadMsg("");
    setUploading(true);

    try {
      const formData = new FormData();
      const file = fileInputRef.current?.files?.[0];
      if (file) formData.append("proof", file);
      formData.append("bankName", paymentForm.bankName);
      formData.append("accountName", paymentForm.accountName);
      formData.append("amount", paymentForm.amount || String(reservation.totalPrice));
      formData.append("transferDate", paymentForm.transferDate);

      const res = await fetch(`/api/reservations/${reservation.id}/payment`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUploadMsg("Bukti pembayaran berhasil diunggah!");
      fetchReservation(reservation.id);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Gagal mengunggah");
    } finally {
      setUploading(false);
    }
  };

  // Lookup mode
  if (lookupMode) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 flex-1">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-center mb-8">
              <p className="text-4xl mb-3">🔍</p>
              <h1 className="text-2xl font-bold text-navy">Cek Status Reservasi</h1>
              <p className="text-gray-400 text-sm mt-2">
                Masukkan ID reservasi atau nomor WhatsApp Anda
              </p>
            </div>

            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              {lookupError && (
                <p className="text-red-500 text-sm">{lookupError}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-gold to-gold-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Cari Reservasi
              </button>
            </form>
          </div>
        </div>
        <Footer />
        <WhatsAppButton />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl mb-3">😕</p>
            <p className="text-gray-500">Reservasi tidak ditemukan</p>
            <Link href="/" className="text-gold mt-4 inline-block hover:underline">
              ← Kembali ke beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = statusConfig[reservation.status] || statusConfig.pending_approval;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Status Header */}
        <div className="text-center mb-8">
          <p className="text-5xl mb-3">{status.icon}</p>
          <h1 className="text-2xl font-bold text-navy">{status.label}</h1>
          <p className="text-gray-400 mt-2">{status.description}</p>
          {reservation.invoiceNumber && (
            <p className="text-sm text-gray-500 mt-2">
              Invoice: <span className="font-mono font-semibold">{reservation.invoiceNumber}</span>
            </p>
          )}
        </div>

        {/* Access Code (for confirmed) */}
        {reservation.status === "confirmed" && reservation.accessCode && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 text-center mb-6">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-2">
              Kode Akses Kunci
            </p>
            <p className="text-5xl font-mono font-bold text-green-700 tracking-[0.3em]">
              {reservation.accessCode}
            </p>
            <p className="text-green-600/70 text-sm mt-3">
              Gunakan kode ini untuk membuka pintu kamar Anda
            </p>
          </div>
        )}

        {/* Reservation Details Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-navy mb-4">Detail Reservasi</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">ID Reservasi</span>
              <span className="font-mono font-semibold text-navy text-xs">{reservation.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tamu</span>
              <span className="text-navy font-medium">{reservation.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Kamar</span>
              <span className="text-navy font-medium">
                {reservation.room.name} (Lantai {reservation.room.floor})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Check-in</span>
              <span className="text-navy">{formatDate(reservation.checkIn)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Check-out</span>
              <span className="text-navy">{formatDate(reservation.checkOut)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Durasi</span>
              <span className="text-navy">{reservation.totalNights} malam</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold">
              <span className="text-navy">Total</span>
              <span className="text-gold text-lg">{formatPrice(reservation.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form (for approved status) */}
        {(reservation.status === "approved" || reservation.status === "invoice_issued") && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="font-bold text-navy mb-4">Upload Bukti Pembayaran</h2>

            {/* Payment Instructions */}
            <div className="bg-warm-gray rounded-xl p-4 mb-4 text-sm">
              <p className="font-semibold text-navy mb-2">Transfer ke:</p>
              <p className="text-gray-600">Bank BCA a.n. [Nama Admin]</p>
              <p className="text-gray-600">No. Rek: [Nomor Rekening]</p>
              <p className="text-gold font-bold mt-2">
                Nominal: {formatPrice(reservation.totalPrice)}
              </p>
            </div>

            {uploadMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">
                {uploadMsg}
              </div>
            )}
            {uploadError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                {uploadError}
              </div>
            )}

            <form onSubmit={handlePaymentUpload} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Bank Pengirim
                  </label>
                  <input
                    type="text"
                    value={paymentForm.bankName}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, bankName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                    placeholder="BCA, Mandiri, dll"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Atas Nama
                  </label>
                  <input
                    type="text"
                    value={paymentForm.accountName}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, accountName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                    placeholder="Nama di rekening"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Nominal Transfer
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                    placeholder={String(reservation.totalPrice)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Tanggal Transfer
                  </label>
                  <input
                    type="date"
                    value={paymentForm.transferDate}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, transferDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Bukti Transfer (Screenshot)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 bg-gradient-to-r from-gold to-gold-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {uploading ? "Mengunggah..." : "Kirim Bukti Pembayaran"}
              </button>
            </form>
          </div>
        )}

        {/* Payment Status (for paid status) */}
        {reservation.status === "paid" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="font-bold text-navy mb-4">Status Pembayaran</h2>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-blue-700 font-medium">
                Bukti pembayaran sedang diverifikasi oleh admin.
              </p>
              <p className="text-blue-500 text-sm mt-1">
                Anda akan menerima notifikasi setelah diverifikasi.
              </p>
            </div>
          </div>
        )}

        {/* Note */}
        <div className="text-center text-sm text-gray-400">
          <p>
            Butuh bantuan?{" "}
            <a
              href="https://wa.me/62811412805"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              Hubungi Admin via WhatsApp
            </a>
          </p>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

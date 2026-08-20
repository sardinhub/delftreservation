"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
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
    transferDate: string | null;
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

const statusBadges: Record<string, string> = {
  pending_approval: "badge-pending",
  approved: "badge-approved",
  rejected: "badge-rejected",
  invoice_issued: "badge-invoice",
  paid: "badge-paid",
  confirmed: "badge-confirmed",
  cancelled: "badge-cancelled",
};

const statusLabels: Record<string, string> = {
  pending_approval: "Menunggu Review",
  approved: "Disetujui",
  rejected: "Ditolak",
  invoice_issued: "Invoice Diterbitkan",
  paid: "Dibayar",
  confirmed: "Terkonfirmasi",
  cancelled: "Dibatalkan",
};

export default function AdminReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchReservation = () => {
    fetch(`/api/reservations?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        setReservation(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservation();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch(`/api/reservations/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: "success", text: "Reservasi berhasil di-approve!" });
      fetchReservation();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal approve",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Yakin ingin menolak reservasi ini?")) return;
    setActionLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch(`/api/reservations/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Ditolak oleh admin" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: "success", text: "Reservasi ditolak." });
      fetchReservation();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menolak",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirm("Konfirmasi pembayaran dan generate kode akses?")) return;
    setActionLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch(`/api/reservations/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({
        type: "success",
        text: `Berhasil! Kode akses: ${data.accessCode}`,
      });
      fetchReservation();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal konfirmasi",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl mb-2">😕</p>
        <p className="text-gray-500">Reservasi tidak ditemukan</p>
        <Link href="/admin/reservations" className="text-gold hover:underline text-sm mt-2 inline-block">
          ← Kembali ke daftar
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/reservations"
          className="text-gray-400 hover:text-gold transition-colors"
        >
          ←
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-navy">
            Detail Reservasi
          </h1>
          <p className="text-sm text-gray-400 font-mono">{reservation.id}</p>
        </div>
        <span className={`badge ${statusBadges[reservation.status]}`}>
          {statusLabels[reservation.status] || reservation.status}
        </span>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`px-4 py-3 rounded-xl mb-6 text-sm ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guest Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-bold text-navy mb-4">Data Tamu</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Nama</p>
                <p className="font-medium text-navy">{reservation.guestName}</p>
              </div>
              <div>
                <p className="text-gray-400">NIK/KTP</p>
                <p className="font-mono text-navy">{reservation.guestNik}</p>
              </div>
              <div>
                <p className="text-gray-400">No. HP</p>
                <p className="text-navy">{reservation.guestPhone}</p>
              </div>
              <div>
                <p className="text-gray-400">Email</p>
                <p className="text-navy">{reservation.guestEmail || "-"}</p>
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-bold text-navy mb-4">Detail Booking</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Kamar</p>
                <p className="font-medium text-navy">
                  {reservation.room.name} (Lantai {reservation.room.floor})
                </p>
              </div>
              <div>
                <p className="text-gray-400">Harga/Malam</p>
                <p className="text-navy">{formatPrice(reservation.room.price)}</p>
              </div>
              <div>
                <p className="text-gray-400">Check-in</p>
                <p className="text-navy">{formatDate(reservation.checkIn)}</p>
              </div>
              <div>
                <p className="text-gray-400">Check-out</p>
                <p className="text-navy">{formatDate(reservation.checkOut)}</p>
              </div>
              <div>
                <p className="text-gray-400">Durasi</p>
                <p className="text-navy">{reservation.totalNights} malam</p>
              </div>
              <div>
                <p className="text-gray-400">Total</p>
                <p className="font-bold text-gold text-lg">
                  {formatPrice(reservation.totalPrice)}
                </p>
              </div>
              {reservation.invoiceNumber && (
                <div className="col-span-2">
                  <p className="text-gray-400">Invoice</p>
                  <p className="font-mono font-semibold text-navy">
                    {reservation.invoiceNumber}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Proof */}
          {reservation.payment && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="font-bold text-navy mb-4">Bukti Pembayaran</h2>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-400">Bank</p>
                  <p className="text-navy">{reservation.payment.bankName || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Atas Nama</p>
                  <p className="text-navy">{reservation.payment.accountName || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Jumlah</p>
                  <p className="text-navy font-semibold">
                    {formatPrice(reservation.payment.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Status Verifikasi</p>
                  <span
                    className={`badge ${reservation.payment.verifiedByAdmin ? "badge-confirmed" : "badge-pending"}`}
                  >
                    {reservation.payment.verifiedByAdmin
                      ? "Terverifikasi"
                      : "Belum Diverifikasi"}
                  </span>
                </div>
              </div>
              {reservation.payment.proofImage &&
                reservation.payment.proofImage !==
                  "/uploads/payments/placeholder.jpg" && (
                  <div className="mt-3">
                    <img
                      src={reservation.payment.proofImage}
                      alt="Bukti Transfer"
                      className="max-w-sm rounded-lg border border-gray-200"
                    />
                  </div>
                )}
            </div>
          )}

          {/* Access Code */}
          {reservation.accessCode && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h2 className="font-bold text-green-700 mb-2">Kode Akses</h2>
              <p className="text-3xl font-mono font-bold text-green-800 tracking-[0.2em]">
                {reservation.accessCode}
              </p>
            </div>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-bold text-navy mb-4">Aksi</h2>
            <div className="space-y-3">
              {reservation.status === "pending_approval" && (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
                  >
                    {actionLoading ? "Memproses..." : "✓ Approve & Buat Invoice"}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="w-full py-3 bg-red-50 text-red-600 font-semibold rounded-xl border border-red-200 hover:bg-red-100 transition-all disabled:opacity-50"
                  >
                    ✕ Tolak Reservasi
                  </button>
                </>
              )}

              {reservation.status === "paid" && (
                <button
                  onClick={handleConfirm}
                  disabled={actionLoading}
                  className="w-full py-3 bg-gradient-to-r from-gold to-gold-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/25 transition-all disabled:opacity-50"
                >
                  {actionLoading
                    ? "Memproses..."
                    : "🔑 Konfirmasi & Generate Kode Akses"}
                </button>
              )}

              {!["pending_approval", "paid"].includes(reservation.status) && (
                <p className="text-center text-gray-400 text-sm py-4">
                  Tidak ada aksi yang tersedia untuk status ini.
                </p>
              )}
            </div>
          </div>

          {/* WhatsApp Contact */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-bold text-navy mb-3">Hubungi Tamu</h2>
            <a
              href={`https://wa.me/62${reservation.guestPhone.replace(/^0/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat WhatsApp
            </a>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-bold text-navy mb-3">Riwayat</h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Dibuat</span>
                <span className="text-navy">
                  {new Date(reservation.createdAt).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

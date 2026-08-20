"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  totalRooms: number;
  totalReservations: number;
  pendingCount: number;
  confirmedCount: number;
  paidCount: number;
  totalRevenue: number;
  recentReservations: Array<{
    id: string;
    guestName: string;
    status: string;
    createdAt: string;
    totalPrice: number;
    room: { name: string };
  }>;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
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
  pending_approval: "Pending",
  approved: "Approved",
  rejected: "Ditolak",
  invoice_issued: "Invoice",
  paid: "Paid",
  confirmed: "Confirmed",
  cancelled: "Dibatalkan",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/rooms").then((r) => r.json()),
      fetch("/api/reservations").then((r) => r.json()),
    ])
      .then(([rooms, reservations]) => {
        const pendingCount = reservations.filter(
          (r: { status: string }) => r.status === "pending_approval"
        ).length;
        const confirmedCount = reservations.filter(
          (r: { status: string }) => r.status === "confirmed"
        ).length;
        const paidCount = reservations.filter(
          (r: { status: string }) => r.status === "paid"
        ).length;
        const totalRevenue = reservations
          .filter((r: { status: string }) => ["confirmed", "paid"].includes(r.status))
          .reduce((sum: number, r: { totalPrice: number }) => sum + r.totalPrice, 0);

        setStats({
          totalRooms: Array.isArray(rooms) ? rooms.length : 0,
          totalReservations: Array.isArray(reservations) ? reservations.length : 0,
          pendingCount,
          confirmedCount,
          paidCount,
          totalRevenue,
          recentReservations: (Array.isArray(reservations) ? reservations : [])
            .slice(0, 5),
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20 text-gray-400">
        Gagal memuat data dashboard
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Kamar</p>
              <p className="text-2xl font-bold text-navy">{stats.totalRooms}</p>
            </div>
            <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-lg">
              🏠
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Menunggu Review</p>
              <p className="text-2xl font-bold text-amber-600">
                {stats.pendingCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-lg">
              ⏳
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Terkonfirmasi</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.confirmedCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-lg">
              ✅
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pendapatan</p>
              <p className="text-lg font-bold text-gold">
                {formatPrice(stats.totalRevenue)}
              </p>
            </div>
            <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-lg">
              💰
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/reservations?status=pending_approval"
          className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gold/30 hover:shadow-md transition-all text-center"
        >
          <p className="text-2xl mb-2">📋</p>
          <p className="font-semibold text-navy text-sm">Review Reservasi</p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.pendingCount} menunggu review
          </p>
        </Link>
        <Link
          href="/admin/reservations?status=paid"
          className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gold/30 hover:shadow-md transition-all text-center"
        >
          <p className="text-2xl mb-2">💳</p>
          <p className="font-semibold text-navy text-sm">Verifikasi Pembayaran</p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.paidCount} menunggu verifikasi
          </p>
        </Link>
        <Link
          href="/admin/rooms"
          className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gold/30 hover:shadow-md transition-all text-center"
        >
          <p className="text-2xl mb-2">⚙️</p>
          <p className="font-semibold text-navy text-sm">Kelola Kamar</p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.totalRooms} unit aktif
          </p>
        </Link>
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-navy">Reservasi Terbaru</h2>
          <Link
            href="/admin/reservations"
            className="text-sm text-gold hover:underline"
          >
            Lihat Semua →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-5 py-3 text-gray-400 font-medium">
                  Tamu
                </th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium">
                  Kamar
                </th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium">
                  Status
                </th>
                <th className="text-right px-5 py-3 text-gray-400 font-medium">
                  Total
                </th>
                <th className="text-right px-5 py-3 text-gray-400 font-medium">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentReservations.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium text-navy">{r.guestName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{r.room.name}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${statusBadges[r.status] || "badge-cancelled"}`}>
                      {statusLabels[r.status] || r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-navy">
                    {formatPrice(r.totalPrice)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/reservations/${r.id}`}
                      className="text-gold hover:underline text-xs font-medium"
                    >
                      Detail →
                    </Link>
                  </td>
                </tr>
              ))}
              {stats.recentReservations.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-gray-400"
                  >
                    Belum ada reservasi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

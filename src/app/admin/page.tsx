"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  total: number;
  lunas: number;
  dp: number;
  menunggu: number;
  totalRevenue: number;
}

interface Reservation {
  id: string;
  guestName: string;
  price: number;
  status: string;
  checkIn: string;
  checkOut: string;
  invoiceNumber: string | null;
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
    month: "short",
    year: "numeric",
  });
}

const statusConfig: Record<string, { label: string; color: string }> = {
  lunas: { label: "Lunas", color: "bg-green-100 text-green-700" },
  dp: { label: "DP", color: "bg-yellow-100 text-yellow-700" },
  menunggu_pembayaran: { label: "Menunggu", color: "bg-gray-100 text-gray-600" },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setRecent(data.recent);
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

  return (
    <div>
      <div className="mb-5 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">Ringkasan reservasi apartemen</p>
      </div>

      {/* Stats Cards — 2x2 grid always, compact on mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-8">
        <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-gray-100">
          <p className="text-[11px] sm:text-sm text-gray-400">Total</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">{stats?.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-gray-100">
          <p className="text-[11px] sm:text-sm text-gray-400">Lunas</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-0.5 sm:mt-1">{stats?.lunas || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-gray-100">
          <p className="text-[11px] sm:text-sm text-gray-400">DP</p>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-0.5 sm:mt-1">{stats?.dp || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-gray-100">
          <p className="text-[11px] sm:text-sm text-gray-400">Menunggu</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-400 mt-0.5 sm:mt-1">{stats?.menunggu || 0}</p>
        </div>
      </div>

      {/* Revenue */}
      <div className="bg-gradient-to-r from-[#1a2744] to-[#2a3d5f] rounded-xl p-4 sm:p-6 mb-5 sm:mb-8 text-white">
        <p className="text-white/60 text-xs sm:text-sm">Total Pendapatan</p>
        <p className="text-2xl sm:text-3xl font-bold mt-0.5 sm:mt-1">{formatPrice(stats?.totalRevenue || 0)}</p>
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-sm sm:text-base">Reservasi Terbaru</h2>
          <Link href="/admin/reservations" className="text-xs sm:text-sm text-gold hover:underline">
            Lihat Semua →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recent.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 sm:py-12 text-center text-gray-400">
              <p className="text-2xl sm:text-3xl mb-2">📋</p>
              <p className="text-sm">Belum ada reservasi</p>
              <Link
                href="/admin/reservations/new"
                className="inline-block mt-3 text-gold text-sm font-medium hover:underline"
              >
                + Tambah Reservasi Baru
              </Link>
            </div>
          ) : (
            recent.map((r) => {
              const st = statusConfig[r.status] || statusConfig.menunggu_pembayaran;
              return (
                <Link
                  key={r.id}
                  href={`/admin/reservations/${r.id}`}
                  className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors active:bg-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">{r.guestName}</p>
                    <p className="text-[11px] sm:text-sm text-gray-400 mt-0.5 truncate">
                      {r.room.name} · {formatDate(r.checkIn)} → {formatDate(r.checkOut)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 ml-3 flex-shrink-0">
                    <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${st.color}`}>
                      {st.label}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap hidden xs:block">
                      {formatPrice(r.price)}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

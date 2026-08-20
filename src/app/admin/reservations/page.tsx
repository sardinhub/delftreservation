"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  lunas: { label: "Lunas", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  dp: { label: "DP", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  menunggu_pembayaran: { label: "Menunggu", color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/reservations")
      .then((r) => r.json())
      .then((data) => {
        setReservations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = reservations.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search && !r.guestName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reservasi</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">{reservations.length} total reservasi</p>
        </div>
        <Link
          href="/admin/reservations/new"
          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gold text-white font-semibold rounded-xl hover:bg-gold-dark transition-colors text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
        >
          + Baru
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 sm:mb-6 space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Cari nama tamu..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
        />
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {[
            { value: "all", label: "Semua" },
            { value: "lunas", label: "Lunas" },
            { value: "dp", label: "DP" },
            { value: "menunggu_pembayaran", label: "Menunggu" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                filter === f.value
                  ? "bg-gold text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 font-semibold text-gray-500">Tamu</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500">Kamar</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500">Check-in</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500">Check-out</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500">Harga</th>
                <th className="text-center px-6 py-3 font-semibold text-gray-500">Status</th>
                <th className="text-center px-6 py-3 font-semibold text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    Tidak ada reservasi ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const st = statusConfig[r.status] || statusConfig.menunggu_pembayaran;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{r.guestName}</p>
                        {r.invoiceNumber && (
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{r.invoiceNumber}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{r.room.name}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(r.checkIn)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(r.checkOut)}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-700">
                        {formatPrice(r.price)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/reservations/${r.id}`}
                            className="text-gold hover:underline text-sm font-medium"
                          >
                            Detail
                          </Link>
                          {r.status === "lunas" && r.invoiceNumber && (
                            <Link
                              href={`/admin/invoice/${r.id}`}
                              className="text-blue-500 hover:underline text-sm font-medium"
                            >
                              Invoice
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: Card View */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 px-6 py-12 text-center text-gray-400">
            <p className="text-3xl mb-2">📋</p>
            <p>Tidak ada reservasi ditemukan</p>
          </div>
        ) : (
          filtered.map((r) => {
            const st = statusConfig[r.status] || statusConfig.menunggu_pembayaran;
            return (
              <Link
                key={r.id}
                href={`/admin/reservations/${r.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-gold/30 transition-colors active:scale-[0.98]"
              >
                {/* Top row: name + status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{r.guestName}</p>
                    {r.invoiceNumber && (
                      <p className="text-[11px] text-gray-400 font-mono">{r.invoiceNumber}</p>
                    )}
                  </div>
                  <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ${st.color}`}>
                    {st.label}
                  </span>
                </div>

                {/* Room badge */}
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                    🚪 {r.room.name}
                  </span>
                </div>

                {/* Dates */}
                <div className="flex items-center text-xs text-gray-500 gap-1 mb-2.5">
                  <span>{formatDate(r.checkIn)}</span>
                  <span className="text-gray-300">→</span>
                  <span>{formatDate(r.checkOut)}</span>
                </div>

                {/* Bottom row: price + actions */}
                <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                  <span className="font-bold text-sm text-gray-900">{formatPrice(r.price)}</span>
                  <div className="flex items-center gap-3">
                    {r.status === "lunas" && r.invoiceNumber && (
                      <span className="text-xs text-blue-500 font-medium">🧾 Invoice</span>
                    )}
                    <span className="text-xs text-gold font-medium">Detail →</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

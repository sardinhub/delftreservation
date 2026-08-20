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

const statusConfig: Record<string, { label: string; color: string }> = {
  lunas: { label: "Lunas", color: "bg-green-100 text-green-700" },
  dp: { label: "DP", color: "bg-yellow-100 text-yellow-700" },
  menunggu_pembayaran: { label: "Menunggu", color: "bg-gray-100 text-gray-600" },
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservasi</h1>
          <p className="text-gray-500 text-sm mt-1">{reservations.length} total reservasi</p>
        </div>
        <Link
          href="/admin/reservations/new"
          className="px-4 py-2 bg-gold text-white font-semibold rounded-xl hover:bg-gold-dark transition-colors text-sm"
        >
          + Tambah Baru
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama tamu..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
        />
        <div className="flex gap-2">
          {[
            { value: "all", label: "Semua" },
            { value: "lunas", label: "Lunas" },
            { value: "dp", label: "DP" },
            { value: "menunggu_pembayaran", label: "Menunggu" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
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
    </div>
  );
}

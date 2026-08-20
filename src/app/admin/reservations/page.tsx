"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Reservation {
  id: string;
  guestName: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  totalNights: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  room: { name: string; floor: number };
  payment: { verifiedByAdmin: boolean } | null;
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
  pending_approval: "Menunggu Review",
  approved: "Disetujui",
  rejected: "Ditolak",
  invoice_issued: "Invoice Diterbitkan",
  paid: "Dibayar",
  confirmed: "Terkonfirmasi",
  cancelled: "Dibatalkan",
};

const statusFilters = [
  { value: "", label: "Semua" },
  { value: "pending_approval", label: "Menunggu" },
  { value: "approved", label: "Disetujui" },
  { value: "paid", label: "Dibayar" },
  { value: "confirmed", label: "Terkonfirmasi" },
  { value: "rejected", label: "Ditolak" },
];

function ReservationsContent() {
  const searchParams = useSearchParams();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(
    searchParams.get("status") || ""
  );

  const fetchReservations = (status?: string) => {
    setLoading(true);
    const url = status
      ? `/api/reservations?status=${status}`
      : "/api/reservations";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setReservations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const status = searchParams.get("status") || "";
    setActiveFilter(status);
    fetchReservations(status);
  }, [searchParams]);

  const handleFilterChange = (status: string) => {
    setActiveFilter(status);
    fetchReservations(status);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Reservasi</h1>
        <span className="text-sm text-gray-400">
          {reservations.length} total
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === filter.value
                ? "bg-gold text-white"
                : "bg-white text-gray-500 border border-gray-200 hover:border-gold/30"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            Tidak ada reservasi ditemukan
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-gray-400 font-medium">
                    ID
                  </th>
                  <th className="text-left px-5 py-3 text-gray-400 font-medium">
                    Tamu
                  </th>
                  <th className="text-left px-5 py-3 text-gray-400 font-medium">
                    Kamar
                  </th>
                  <th className="text-left px-5 py-3 text-gray-400 font-medium">
                    Tanggal
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
                {reservations.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-gray-400">
                        {r.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-navy">{r.guestName}</p>
                      <p className="text-xs text-gray-400">{r.guestPhone}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {r.room.name}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-gray-600">
                        {new Date(r.checkIn).toLocaleDateString("id-ID")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {r.totalNights} malam
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`badge ${statusBadges[r.status] || "badge-cancelled"}`}
                      >
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
                        Kelola →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminReservationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReservationsContent />
    </Suspense>
  );
}

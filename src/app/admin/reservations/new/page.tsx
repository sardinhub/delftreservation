"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewReservationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    guestName: "",
    roomType: "",
    roomNumber: "",
    checkIn: "",
    checkOut: "",
    price: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: form.guestName,
          roomType: form.roomType,
          roomNumber: form.roomNumber,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          price: parseInt(form.price),
          notes: form.notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/admin/reservations/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat reservasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Link href="/admin/reservations" className="text-xs sm:text-sm text-gray-400 hover:text-gold">
          ← Kembali
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">Reservasi Baru</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">Input data reservasi tamu secara manual</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 sm:mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Nama Tamu *
            </label>
            <input
              type="text"
              required
              value={form.guestName}
              onChange={(e) => setForm({ ...form, guestName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
              placeholder="Nama lengkap tamu"
            />
          </div>

          {/* Type Kamar + Room Number — side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                Type Kamar *
              </label>
              <input
                type="text"
                required
                value={form.roomType}
                onChange={(e) => setForm({ ...form, roomType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                placeholder="Contoh: Deluxe, Standard, Suite"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                Room *
              </label>
              <input
                type="text"
                required
                value={form.roomNumber}
                onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                placeholder="Contoh: 101, 202, A3"
              />
            </div>
          </div>

          {/* Dates — stack on mobile, side-by-side on tablet+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                Tanggal Check-in *
              </label>
              <input
                type="date"
                required
                value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                Tanggal Check-out *
              </label>
              <input
                type="date"
                required
                value={form.checkOut}
                min={form.checkIn || undefined}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Harga (Rp) *
            </label>
            <input
              type="number"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
              placeholder="Contoh: 500000"
            />
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1">Input harga secara manual (total untuk seluruh masa inap)</p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Catatan
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none resize-none"
              rows={3}
              placeholder="Catatan tambahan (opsional)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gold text-white font-semibold rounded-xl hover:bg-gold-dark transition-all disabled:opacity-50 text-sm active:scale-[0.98]"
          >
            {loading ? "Menyimpan..." : "Simpan Reservasi"}
          </button>
        </form>
      </div>
    </div>
  );
}

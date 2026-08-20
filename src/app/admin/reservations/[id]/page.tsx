"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Reservation {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  price: number;
  status: string;
  invoiceNumber: string | null;
  notes: string | null;
  createdAt: string;
  room: { id: string; name: string };
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

const statusConfig: Record<string, { label: string; color: string }> = {
  lunas: { label: "Lunas", color: "bg-green-100 text-green-700" },
  dp: { label: "DP", color: "bg-yellow-100 text-yellow-700" },
  menunggu_pembayaran: { label: "Menunggu Pembayaran", color: "bg-gray-100 text-gray-600" },
};

export default function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    guestName: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    price: "",
    status: "",
    notes: "",
  });

  const fetchReservation = () => {
    fetch(`/api/reservations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setReservation(data);
        setForm({
          guestName: data.guestName,
          roomId: data.roomId,
          checkIn: data.checkIn.split("T")[0],
          checkOut: data.checkOut.split("T")[0],
          price: String(data.price),
          status: data.status,
          notes: data.notes || "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservation();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: form.guestName,
          roomId: form.roomId,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          price: parseInt(form.price),
          status: form.status,
          notes: form.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: "success", text: "Berhasil disimpan!" });
      fetchReservation();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Gagal menyimpan" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus reservasi ini?")) return;
    try {
      const res = await fetch(`/api/reservations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      router.push("/admin/reservations");
    } catch {
      alert("Gagal menghapus reservasi");
    }
  };

  const generateInvoice = async () => {
    try {
      const res = await fetch(`/api/reservations/${id}/invoice`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: "success", text: `Invoice ${data.invoiceNumber} berhasil dibuat!` });
      fetchReservation();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Gagal membuat invoice" });
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
          ← Kembali
        </Link>
      </div>
    );
  }

  const st = statusConfig[form.status] || statusConfig.menunggu_pembayaran;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/reservations" className="text-gray-400 hover:text-gold">
          ←
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Detail Reservasi</h1>
          <p className="text-sm text-gray-400 font-mono">{reservation.id}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${st.color}`}>
          {st.label}
        </span>
      </div>

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

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Data Reservasi</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Tamu</label>
            <input
              type="text"
              value={form.guestName}
              onChange={(e) => setForm({ ...form, guestName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Check-in</label>
              <input
                type="date"
                value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Check-out</label>
              <input
                type="date"
                value={form.checkOut}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Harga (Rp)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none bg-white"
              >
                <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
                <option value="dp">DP</option>
                <option value="lunas">Lunas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-gold text-white font-semibold rounded-xl hover:bg-gold-dark transition-all disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
        </button>

        {form.status === "lunas" && !reservation.invoiceNumber && (
          <button
            onClick={generateInvoice}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
          >
            🧾 Buat Invoice
          </button>
        )}

        {reservation.invoiceNumber && (
          <Link
            href={`/admin/invoice/${reservation.id}`}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all text-center"
          >
            🧾 Lihat Invoice
          </Link>
        )}

        <button
          onClick={handleDelete}
          className="px-6 py-3 bg-red-50 text-red-600 font-semibold rounded-xl border border-red-200 hover:bg-red-100 transition-all ml-auto"
        >
          🗑️ Hapus
        </button>
      </div>
    </div>
  );
}

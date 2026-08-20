"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";

interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  floor: number;
  status: string;
  image: string | null;
  reservations: { id: string; checkIn: string; checkOut: string; status: string }[];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    guestName: "",
    guestNik: "",
    guestPhone: "",
    guestEmail: "",
    checkIn: "",
    checkOut: "",
  });

  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    fetch(`/api/rooms/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setRoom(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data kamar");
        setLoading(false);
      });
  }, [params.id]);

  useEffect(() => {
    if (form.checkIn && form.checkOut && room) {
      const checkIn = new Date(form.checkIn);
      const checkOut = new Date(form.checkOut);
      if (checkOut > checkIn) {
        const diff = Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        );
        setNights(diff);
        setTotalPrice(diff * room.price);
      } else {
        setNights(0);
        setTotalPrice(0);
      }
    }
  }, [form.checkIn, form.checkOut, room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: params.id,
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat reservasi");
      }

      setSuccess("Reservasi berhasil dibuat! Mengalihkan...");
      setTimeout(() => {
        router.push(`/booking/${data.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Memuat data kamar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl mb-4">😕</p>
            <p className="text-gray-500">Kamar tidak ditemukan</p>
            <Link href="/rooms" className="text-gold mt-4 inline-block hover:underline">
              ← Kembali ke daftar kamar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-6">
          <Link href="/rooms" className="hover:text-gold transition-colors">
            Kamar
          </Link>
          <span className="mx-2">→</span>
          <span className="text-navy">{room.name}</span>
        </div>

        {/* Room Detail Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-8">
          {/* Image placeholder */}
          <div className="h-64 bg-gradient-to-br from-navy to-navy-light relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-3">🏠</div>
                <span className="text-white/60 text-lg font-medium">
                  {room.name}
                </span>
              </div>
            </div>
            <div className="absolute bottom-4 left-6">
              <span className="bg-gold text-white px-4 py-2 rounded-full text-lg font-bold">
                {formatPrice(room.price)}/malam
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-navy">{room.name}</h1>
                <p className="text-gray-400">Lantai {room.floor}</p>
              </div>
              <span
                className={`badge ${
                  room.status === "available"
                    ? "badge-confirmed"
                    : "badge-cancelled"
                }`}
              >
                {room.status === "available" ? "Tersedia" : room.status}
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed">{room.description}</p>

            {/* Amenities */}
            <div className="flex flex-wrap gap-3 mt-6">
              {["🛏️ Queen Bed", "❄️ AC", "📶 WiFi", "🚿 Private Bath", "📺 Smart TV"].map(
                (amenity) => (
                  <span
                    key={amenity}
                    className="bg-warm-gray text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium"
                  >
                    {amenity}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        {room.status === "available" ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-6">
              Formulir Reservasi
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.guestName}
                    onChange={(e) =>
                      setForm({ ...form, guestName: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all"
                    placeholder="Masukkan nama sesuai KTP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">
                    NIK / No. KTP *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.guestNik}
                    onChange={(e) =>
                      setForm({ ...form, guestNik: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all"
                    placeholder="16 digit NIK"
                    maxLength={16}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">
                    No. WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.guestPhone}
                    onChange={(e) =>
                      setForm({ ...form, guestPhone: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.guestEmail}
                    onChange={(e) =>
                      setForm({ ...form, guestEmail: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all"
                    placeholder="opsional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">
                    Check-in *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.checkIn}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setForm({ ...form, checkIn: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">
                    Check-out *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.checkOut}
                    min={form.checkIn || new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setForm({ ...form, checkOut: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all"
                  />
                </div>
              </div>

              {/* Price Summary */}
              {nights > 0 && (
                <div className="bg-warm-gray rounded-xl p-5">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>
                      {formatPrice(room.price)} × {nights} malam
                    </span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-navy">
                    <span>Total</span>
                    <span className="text-gold">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || nights === 0}
                className="w-full py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-semibold rounded-xl text-lg hover:shadow-lg hover:shadow-gold/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Memproses..." : "Ajukan Reservasi"}
              </button>

              <p className="text-center text-xs text-gray-400">
                Reservasi akan dikirim ke admin untuk persetujuan. Anda akan
                menerima invoice setelah disetujui.
              </p>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <p className="text-2xl mb-2">🔒</p>
            <p className="text-gray-500 font-medium">
              Kamar ini sedang tidak tersedia untuk dipesan.
            </p>
            <Link
              href="/rooms"
              className="text-gold mt-4 inline-block hover:underline"
            >
              ← Lihat kamar lainnya
            </Link>
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

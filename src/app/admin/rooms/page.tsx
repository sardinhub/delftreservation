"use client";

import { useState, useEffect } from "react";

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

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    floor: "",
    status: "available",
  });

  const fetchRooms = () => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data) => {
        setRooms(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setForm({
      name: room.name,
      description: room.description,
      price: String(room.price),
      floor: String(room.floor),
      status: room.status,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const url = editingRoom
        ? `/api/rooms/${editingRoom.id}`
        : "/api/rooms";
      const method = editingRoom ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({
        type: "success",
        text: editingRoom ? "Kamar berhasil diperbarui!" : "Kamar baru berhasil dibuat!",
      });
      setShowForm(false);
      setEditingRoom(null);
      fetchRooms();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (roomId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal update status");
      fetchRooms();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal update status",
      });
    }
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm("Yakin ingin menghapus kamar ini?")) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      setMessage({ type: "success", text: "Kamar berhasil dihapus." });
      fetchRooms();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus",
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Kelola Kamar</h1>
        <button
          onClick={() => {
            setEditingRoom(null);
            setForm({
              name: "",
              description: "",
              price: "500000",
              floor: "1",
              status: "available",
            });
            setShowForm(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-gold to-gold-dark text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          + Tambah Kamar
        </button>
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-navy mb-4">
              {editingRoom ? "Edit Kamar" : "Tambah Kamar Baru"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">
                  Nama Kamar
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">
                    Harga/Malam (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">
                    Lantai
                  </label>
                  <input
                    type="number"
                    required
                    value={form.floor}
                    onChange={(e) => setForm({ ...form, floor: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none"
                >
                  <option value="available">Tersedia</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="unavailable">Tidak Tersedia</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRoom(null);
                  }}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-gold to-gold-dark text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rooms Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => {
            const activeBookings = room.reservations.filter(
              (r) =>
                r.status === "confirmed" &&
                new Date(r.checkOut) > new Date()
            ).length;

            return (
              <div
                key={room.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <div className="h-32 bg-gradient-to-br from-navy to-navy-light relative flex items-center justify-center">
                  <span className="text-white/40 text-lg">{room.name}</span>
                  <div className="absolute top-3 right-3">
                    <select
                      value={room.status}
                      onChange={(e) =>
                        handleStatusChange(room.id, e.target.value)
                      }
                      className="text-xs bg-white/20 text-white border border-white/30 rounded-lg px-2 py-1 backdrop-blur-sm outline-none"
                    >
                      <option value="available" className="text-navy">
                        Tersedia
                      </option>
                      <option value="maintenance" className="text-navy">
                        Maintenance
                      </option>
                      <option value="unavailable" className="text-navy">
                        Tidak Tersedia
                      </option>
                    </select>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-navy">{room.name}</h3>
                      <p className="text-xs text-gray-400">
                        Lantai {room.floor}
                      </p>
                    </div>
                    <span className="font-bold text-gold">
                      {formatPrice(room.price)}/malam
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {room.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {activeBookings} booking aktif
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(room)}
                        className="px-3 py-1.5 text-xs font-medium text-gold border border-gold/30 rounded-lg hover:bg-gold/5 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-all"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

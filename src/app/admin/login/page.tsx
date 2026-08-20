"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login gagal");
      }

      // Cookie is set server-side via httpOnly — no localStorage needed
      router.push("/admin");
      router.refresh(); // Force layout re-render to pick up session
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh bg-navy flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-white font-bold text-xl sm:text-2xl">D</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-white/40 text-xs sm:text-sm mt-1">DELFT APARTMENT</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-8 border border-white/10">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-5 sm:mb-6">Masuk ke Dashboard</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                autoCapitalize="none"
                autoComplete="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-3.5 bg-white/10 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:ring-2 focus:ring-gold/50 focus:border-gold/50 outline-none"
                placeholder="Masukkan username"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3.5 bg-white/10 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:ring-2 focus:ring-gold/50 focus:border-gold/50 outline-none"
                placeholder="Masukkan password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-gold to-gold-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/25 transition-all disabled:opacity-50 mt-2 active:scale-[0.98]"
            >
              {loading ? "Masuk..." : "Masuk"}
            </button>
          </form>

          <p className="text-center text-white/30 text-xs mt-5 sm:mt-6">
            Default: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
}

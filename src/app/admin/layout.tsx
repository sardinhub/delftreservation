"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<{ name: string } | null>(null);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    fetch("/api/admin/me")
      .then((r) => {
        if (!r.ok) throw new Error("Not authenticated");
        return r.json();
      })
      .then((data) => {
        setAdmin(data.admin);
        setLoading(false);
      })
      .catch(() => {
        router.push("/admin/login");
      });
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // Login page doesn't need the layout shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="font-bold text-lg text-navy">
                🏢 DELFT APARTMENT
              </Link>
              <div className="hidden sm:flex items-center gap-1">
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === "/admin"
                      ? "bg-gold/10 text-gold"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/reservations"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith("/admin/reservations")
                      ? "bg-gold/10 text-gold"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Reservasi
                </Link>
                <Link
                  href="/admin/reservations/new"
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-gold text-white hover:bg-gold-dark transition-colors"
                >
                  + Baru
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden sm:block">
                {admin?.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<{ name: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

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

  const navLinks = [
    { href: "/admin", label: "Dashboard", emoji: "📊" },
    { href: "/admin/reservations", label: "Reservasi", emoji: "📋" },
    { href: "/admin/reservations/new", label: "Tambah Baru", emoji: "➕", highlight: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left: Logo + Desktop Nav */}
            <div className="flex items-center gap-4 sm:gap-8">
              <Link href="/admin" className="flex items-center gap-2 whitespace-nowrap">
                <Image
                  src="/logo-delft.svg"
                  alt="DELFT APARTMENT"
                  width={120}
                  height={35}
                  className="h-8 sm:h-9 w-auto"
                  priority
                />
              </Link>
              <div className="hidden sm:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      link.highlight
                        ? "bg-gold text-white hover:bg-gold-dark"
                        : pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
                        ? "bg-gold/10 text-gold"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: User + Hamburger */}
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm text-gray-400 hidden md:block">
                {admin?.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm text-gray-400 hover:text-red-500 transition-colors hidden sm:block"
              >
                Keluar
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Menu"
              >
                <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-200 ${mobileMenuOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
                <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-200 mt-1 ${mobileMenuOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 sm:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-14 sm:top-16 right-0 w-64 bg-white border-l border-b border-gray-200 shadow-xl z-30 transform transition-transform duration-200 sm:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                link.highlight
                  ? "bg-gold text-white"
                  : pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
                  ? "bg-gold/10 text-gold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="mr-2">{link.emoji}</span>
              {link.label}
            </Link>
          ))}
          <hr className="border-gray-100 my-2" />
          <p className="px-4 py-2 text-xs text-gray-400">{admin?.name}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            🚪 Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:py-6 lg:py-8 py-4">
        {children}
      </main>
    </div>
  );
}

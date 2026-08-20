"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/rooms", label: "Kamar" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return null;

  return (
    <nav className="sticky top-0 z-50 bg-navy/95 backdrop-blur-md border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-light to-gold-dark flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-wider">
                DELFT
              </span>
              <span className="text-gold text-xs block -mt-1 tracking-widest">
                APARTMENT
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-gold"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/rooms"
              className="px-5 py-2 bg-gradient-to-r from-gold to-gold-dark text-white text-sm font-semibold rounded-full hover:shadow-lg hover:shadow-gold/25 transition-all"
            >
              Reservasi Sekarang
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link
              href="/rooms"
              className="px-4 py-2 bg-gradient-to-r from-gold to-gold-dark text-white text-sm font-semibold rounded-full"
            >
              Booking
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

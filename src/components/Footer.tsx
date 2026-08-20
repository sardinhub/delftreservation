import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy text-white/70 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
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
            </div>
            <p className="text-sm leading-relaxed">
              Apartemen eksklusif di kawasan CPI Makassar. Nikmati kenyamanan
              dan kemewahan hunian premium dengan pemandangan laut yang
              menakjubkan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wider text-sm uppercase">
              Menu
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-gold transition-colors text-sm">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="hover:text-gold transition-colors text-sm">
                  Lihat Kamar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wider text-sm uppercase">
              Kontak
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                0811-4128-05
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                Kawasan CPI Makassar, Sulawesi Selatan
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs">
          <p>© {new Date().getFullYear()} DELFT APARTMENT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

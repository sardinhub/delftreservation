import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const features = [
  {
    icon: "🌊",
    title: "View Laut Langsung",
    desc: "Nikmati pemandangan laut CPI Makassar dari balkon kamar Anda.",
  },
  {
    icon: "🔐",
    title: "Smart Lock Access",
    desc: "Sistem akses kunci digital yang aman dan praktis.",
  },
  {
    icon: "📶",
    title: "WiFi Premium",
    desc: "Koneksi internet cepat dan stabil untuk produktivitas Anda.",
  },
  {
    icon: "🅿️",
    title: "Parkir Gratis",
    desc: "Area parkir yang aman dan luas untuk tamu apartemen.",
  },
  {
    icon: "🏊",
    title: "Kolam Renang",
    desc: "Fasilitas kolam renang eksklusif untuk penghuni dan tamu.",
  },
  {
    icon: "🍽️",
    title: "Dekat Kuliner",
    desc: "Akses mudah ke restoran dan café terbaik di kawasan CPI.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy opacity-95" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold-dark rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
              <span className="text-gold text-sm font-medium">
                Kawasan CPI Makassar
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              DELFT{" "}
              <span className="text-gradient-gold">APARTMENT</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 mb-4 font-light">
              Exclusive Living at CPI Makassar
            </p>
            <p className="text-white/40 max-w-2xl mx-auto mb-12 text-lg">
              4 unit apartemen premium dengan pemandangan laut langsung.
              Nikmati pengalaman menginap yang tak terlupakan di jantung kota
              Makassar.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/rooms"
                className="px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-semibold rounded-full text-lg hover:shadow-xl hover:shadow-gold/30 transition-all hover:-translate-y-0.5"
              >
                Lihat Kamar & Reservasi
              </Link>
              <a
                href="https://wa.me/62811412805"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border border-white/20 text-white font-medium rounded-full text-lg hover:bg-white/5 transition-all"
              >
                Hubungi Admin
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mt-16">
              <div>
                <div className="text-3xl font-bold text-gold">4</div>
                <div className="text-white/40 text-sm">Unit Kamar</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gold">⭐</div>
                <div className="text-white/40 text-sm">Premium</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gold">24/7</div>
                <div className="text-white/40 text-sm">Admin Siaga</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold text-sm font-semibold tracking-widest uppercase">
              Fasilitas
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mt-3 mb-4">
              Kenyamanan Premium
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Setiap unit dirancang untuk memberikan pengalaman menginap terbaik
              dengan fasilitas modern dan pelayanan terbaik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="card-luxury bg-white rounded-2xl p-8 text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-navy mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-navy to-navy-light">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Siap untuk Menginap?
          </h2>
          <p className="text-white/60 mb-10 text-lg">
            Pilih kamar favorit Anda dan reservasi dalam hitungan menit.
          </p>
          <Link
            href="/rooms"
            className="inline-block px-10 py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-semibold rounded-full text-lg hover:shadow-xl hover:shadow-gold/30 transition-all"
          >
            Reservasi Sekarang →
          </Link>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

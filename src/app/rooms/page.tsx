import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Link from "next/link";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getRoomStatusInfo(room: {
  status: string;
  reservations: { checkIn: Date; checkOut: Date; status: string }[];
}) {
  if (room.status === "maintenance") {
    return { label: "Maintenance", color: "text-orange-600 bg-orange-50" };
  }
  if (room.status === "unavailable") {
    return { label: "Tidak Tersedia", color: "text-red-600 bg-red-50" };
  }

  const now = new Date();
  const activeBooking = room.reservations.find((r) => {
    const checkIn = new Date(r.checkIn);
    const checkOut = new Date(r.checkOut);
    return now >= checkIn && now < checkOut && r.status === "confirmed";
  });

  if (activeBooking) {
    return {
      label: "Sedang Ditempati",
      color: "text-red-600 bg-red-50",
      until: formatDate(activeBooking.checkOut),
    };
  }

  return { label: "Tersedia", color: "text-green-600 bg-green-50" };
}

export default async function RoomsPage() {
  const rooms = await prisma.room.findMany({
    include: {
      reservations: {
        where: {
          status: {
            notIn: ["rejected", "cancelled"],
          },
        },
        select: {
          id: true,
          checkIn: true,
          checkOut: true,
          status: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-navy py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold text-sm font-semibold tracking-widest uppercase">
            Pilihan Kamar
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-3">
            Unit Apartemen Kami
          </h1>
          <p className="text-white/50 mt-3 max-w-xl mx-auto">
            4 unit premium dengan fasilitas terbaik di kawasan CPI Makassar
          </p>
        </div>
      </section>

      {/* Room Cards */}
      <section className="py-12 bg-cream flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {rooms.map((room) => {
              const statusInfo = getRoomStatusInfo(room);
              const upcomingBookings = room.reservations
                .filter((r) => new Date(r.checkIn) > new Date())
                .sort(
                  (a, b) =>
                    new Date(a.checkIn).getTime() -
                    new Date(b.checkIn).getTime()
                )
                .slice(0, 3);

              return (
                <div
                  key={room.id}
                  className="card-luxury bg-white rounded-2xl overflow-hidden"
                >
                  {/* Room Image Placeholder */}
                  <div className="h-52 bg-gradient-to-br from-navy to-navy-light relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl mb-2">🏠</div>
                        <span className="text-white/60 text-sm">
                          {room.name}
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`badge ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-gold text-white px-3 py-1 rounded-full text-sm font-bold">
                        {formatPrice(room.price)}/malam
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-navy">
                          {room.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Lantai {room.floor}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {room.description}
                    </p>

                    {/* Upcoming Bookings */}
                    {upcomingBookings.length > 0 && (
                      <div className="bg-warm-gray rounded-xl p-4 mb-4">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Jadwal Terisi
                        </h4>
                        {upcomingBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between text-sm py-1"
                          >
                            <span className="text-gray-600">
                              {formatDate(booking.checkIn)} →{" "}
                              {formatDate(booking.checkOut)}
                            </span>
                            <span className="badge badge-confirmed text-xs">
                              {booking.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Link
                      href={`/rooms/${room.id}`}
                      className="block w-full text-center py-3 bg-gradient-to-r from-gold to-gold-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/25 transition-all"
                    >
                      {room.status === "available"
                        ? "Reservasi Sekarang"
                        : "Lihat Detail"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Generate invoice number: INV-YYYYMMDD-XXXX
function generateInvoiceNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");
  return `INV-${date}-${random}`;
}

// GET /api/reservations - List all reservations (admin) or by guest lookup
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const guestPhone = searchParams.get("guestPhone");
    const id = searchParams.get("id");

    // Single reservation lookup
    if (id) {
      const reservation = await prisma.reservation.findUnique({
        where: { id },
        include: { room: true, payment: true },
      });
      if (!reservation) {
        return NextResponse.json(
          { error: "Reservasi tidak ditemukan" },
          { status: 404 }
        );
      }
      return NextResponse.json(reservation);
    }

    // Guest lookup by phone
    if (guestPhone) {
      const reservations = await prisma.reservation.findMany({
        where: { guestPhone },
        include: { room: true, payment: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(reservations);
    }

    // Admin: all reservations with filters
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const reservations = await prisma.reservation.findMany({
      where,
      include: { room: true, payment: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("GET /api/reservations error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data reservasi" },
      { status: 500 }
    );
  }
}

// POST /api/reservations - Create new reservation (guest)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, guestName, guestNik, guestPhone, guestEmail, checkIn, checkOut } =
      body;

    // Validate required fields
    if (!roomId || !guestName || !guestNik || !guestPhone || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Semua field wajib harus diisi (kecuali email)" },
        { status: 400 }
      );
    }

    // Check room exists
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json(
        { error: "Kamar tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check availability - no overlapping approved/confirmed reservations
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: "Tanggal check-out harus setelah check-in" },
        { status: 400 }
      );
    }

    const overlapping = await prisma.reservation.findFirst({
      where: {
        roomId,
        status: {
          notIn: ["rejected", "cancelled"],
        },
        checkIn: { lt: checkOutDate },
        checkOut: { gt: checkInDate },
      },
    });

    if (overlapping) {
      return NextResponse.json(
        {
          error: "Kamar sudah dipesan untuk tanggal tersebut",
          conflictingReservation: overlapping.id,
        },
        { status: 409 }
      );
    }

    // Calculate total nights and price
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = totalNights * room.price;

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        roomId,
        guestName,
        guestNik,
        guestPhone,
        guestEmail: guestEmail || null,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalNights,
        totalPrice,
        status: "pending_approval",
      },
      include: { room: true },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("POST /api/reservations error:", error);
    return NextResponse.json(
      { error: "Gagal membuat reservasi" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customAlphabet } from "nanoid";

const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 25);

// GET /api/reservations - List all reservations
export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reservations);
  } catch (error) {
    console.error("GET /api/reservations error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// POST /api/reservations - Create new reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestName, phone, roomType, roomNumber, checkIn, checkOut, price, notes } = body;

    if (!guestName || !roomType || !roomNumber || !checkIn || !checkOut || !price) {
      return NextResponse.json({ error: "Semua field wajib harus diisi" }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      return NextResponse.json({ error: "Check-out harus setelah check-in" }, { status: 400 });
    }

    const reservation = await prisma.reservation.create({
      data: {
        id: generateId(),
        guestName,
        phone: phone || null,
        roomType,
        roomNumber,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        price: parseInt(price),
        notes: notes || null,
        status: "menunggu_pembayaran",
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("POST /api/reservations error:", error);
    return NextResponse.json({ error: "Gagal membuat reservasi" }, { status: 500 });
  }
}

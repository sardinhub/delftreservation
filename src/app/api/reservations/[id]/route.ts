import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reservations/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reservasi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("GET /api/reservations/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// PUT /api/reservations/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { guestName, roomType, roomNumber, checkIn, checkOut, price, status, notes } = body;

    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Reservasi tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        ...(guestName && { guestName }),
        ...(roomType !== undefined && { roomType }),
        ...(roomNumber !== undefined && { roomNumber }),
        ...(checkIn && { checkIn: new Date(checkIn) }),
        ...(checkOut && { checkOut: new Date(checkOut) }),
        ...(price && { price: parseInt(price) }),
        ...(status && { status }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/reservations/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui reservasi" }, { status: 500 });
  }
}

// DELETE /api/reservations/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.reservation.delete({ where: { id } });
    return NextResponse.json({ message: "Reservasi berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/reservations/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus reservasi" }, { status: 500 });
  }
}

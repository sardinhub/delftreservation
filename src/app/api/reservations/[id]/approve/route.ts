import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelExpiredReservations } from "@/lib/cancel-expired";

function generateInvoiceNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");
  return `INV-${date}-${random}`;
}

// POST /api/reservations/[id]/approve - Admin approves reservation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { notes } = body;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservasi tidak ditemukan" },
        { status: 404 }
      );
    }

    if (reservation.status !== "pending_approval") {
      return NextResponse.json(
        { error: `Reservasi tidak dapat di-approve. Status saat ini: ${reservation.status}` },
        { status: 400 }
      );
    }

    // First, cancel any other expired reservations for this room
    await cancelExpiredReservations();

    // Approve and generate invoice number
    const invoiceNumber = generateInvoiceNumber();

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        status: "approved",
        invoiceNumber,
        approvedAt: new Date(),
        notes: notes || reservation.notes,
      },
      include: { room: true },
    });

    return NextResponse.json({
      message: "Reservasi berhasil di-approve",
      reservation: updated,
      invoice: {
        number: invoiceNumber,
        guest: reservation.guestName,
        room: reservation.room.name,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        nights: reservation.totalNights,
        total: reservation.totalPrice,
      },
    });
  } catch (error) {
    console.error("POST /api/reservations/[id]/approve error:", error);
    return NextResponse.json(
      { error: "Gagal approve reservasi" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customAlphabet } from "nanoid";

const generateAccessCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

// POST /api/reservations/[id]/confirm - Admin confirms payment + generates access code
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
      include: { room: true, payment: true },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservasi tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!["paid", "invoice_issued"].includes(reservation.status)) {
      return NextResponse.json(
        { error: `Konfirmasi tidak dapat dilakukan. Status: ${reservation.status}` },
        { status: 400 }
      );
    }

    // Verify payment exists and is verified
    if (reservation.payment && !reservation.payment.verifiedByAdmin) {
      // Auto-verify the payment
      await prisma.payment.update({
        where: { id: reservation.payment.id },
        data: {
          verifiedByAdmin: true,
          verifiedAt: new Date(),
          notes: notes || "Diverifikasi oleh admin",
        },
      });
    }

    // Generate access code
    const accessCode = generateAccessCode();

    // Update reservation to confirmed
    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        status: "confirmed",
        accessCode,
        notes: notes || reservation.notes,
      },
      include: { room: true, payment: true },
    });

    return NextResponse.json({
      message: "Reservasi berhasil dikonfirmasi! Kode akses telah dibuat.",
      reservation: updated,
      accessCode,
      checkInInstructions: {
        room: reservation.room.name,
        floor: reservation.room.floor,
        code: accessCode,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        message: `Selamat datang di DELFT APARTMENT! Gunakan kode ${accessCode} untuk membuka pintu kamar ${reservation.room.name}. Kode berlaku dari ${new Date(reservation.checkIn).toLocaleDateString("id-ID")} hingga ${new Date(reservation.checkOut).toLocaleDateString("id-ID")}.`,
      },
    });
  } catch (error) {
    console.error("POST /api/reservations/[id]/confirm error:", error);
    return NextResponse.json(
      { error: "Gagal mengkonfirmasi reservasi" },
      { status: 500 }
    );
  }
}

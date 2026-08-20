import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/reservations/[id]/reject - Admin rejects reservation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservasi tidak ditemukan" },
        { status: 404 }
      );
    }

    if (reservation.status !== "pending_approval") {
      return NextResponse.json(
        { error: `Reservasi tidak dapat ditolak. Status saat ini: ${reservation.status}` },
        { status: 400 }
      );
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        status: "rejected",
        notes: reason || "Ditolak oleh admin",
      },
      include: { room: true },
    });

    return NextResponse.json({
      message: "Reservasi berhasil ditolak",
      reservation: updated,
    });
  } catch (error) {
    console.error("POST /api/reservations/[id]/reject error:", error);
    return NextResponse.json(
      { error: "Gagal menolak reservasi" },
      { status: 500 }
    );
  }
}

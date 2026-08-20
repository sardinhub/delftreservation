import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelExpiredReservations } from "@/lib/cancel-expired";

// GET /api/rooms/[id] - Get room details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Auto-cancel expired reservations first
    await cancelExpiredReservations();

    const room = await prisma.room.findUnique({
      where: { id },
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
    });

    if (!room) {
      return NextResponse.json(
        { error: "Kamar tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("GET /api/rooms/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kamar" },
      { status: 500 }
    );
  }
}

// PUT /api/rooms/[id] - Update room (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, floor, status, image } = body;

    const room = await prisma.room.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseInt(price) }),
        ...(floor && { floor: parseInt(floor) }),
        ...(status && { status }),
        ...(image !== undefined && { image }),
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("PUT /api/rooms/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui kamar" },
      { status: 500 }
    );
  }
}

// DELETE /api/rooms/[id] - Delete room (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.room.delete({ where: { id } });

    return NextResponse.json({ message: "Kamar berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/rooms/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus kamar" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelExpiredReservations } from "@/lib/cancel-expired";

// GET /api/rooms - List all rooms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = status ? { status } : {};

    // Auto-cancel expired reservations before showing room availability
    await cancelExpiredReservations();

    const rooms = await prisma.room.findMany({
      where,
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

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("GET /api/rooms error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kamar" },
      { status: 500 }
    );
  }
}

// POST /api/rooms - Create a room (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, floor, image } = body;

    if (!name || !price || !floor) {
      return NextResponse.json(
        { error: "Nama, harga, dan lantai harus diisi" },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        name,
        description: description || "",
        price: parseInt(price),
        floor: parseInt(floor),
        image: image || null,
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("POST /api/rooms error:", error);
    return NextResponse.json(
      { error: "Gagal membuat kamar" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(rooms);
  } catch (error) {
    console.error("GET /api/rooms error:", error);
    return NextResponse.json({ error: "Gagal mengambil data kamar" }, { status: 500 });
  }
}

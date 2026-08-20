import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

// GET /api/reservations/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.execute({
      sql: "SELECT * FROM Reservation WHERE id = ?",
      args: [id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Reservasi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
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
    const { guestName, phone, roomType, roomNumber, checkIn, checkOut, price, status, notes } = body;

    // Check if reservation exists
    // Check if reservation exists
    const existingResult = await db.execute({
      sql: "SELECT id FROM Reservation WHERE id = ?",
      args: [id],
    });

    if (existingResult.rows.length === 0) {
      return NextResponse.json({ error: "Reservasi tidak ditemukan" }, { status: 404 });
    }

    const now = new Date().toISOString();

    // Build update query dynamically
    const updates: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const args: any[] = [];

    if (guestName) { updates.push("guestName = ?"); args.push(guestName); }
    if (phone !== undefined) { updates.push("phone = ?"); args.push(phone || null); }
    if (roomType !== undefined) { updates.push("roomType = ?"); args.push(roomType); }
    if (roomNumber !== undefined) { updates.push("roomNumber = ?"); args.push(roomNumber); }
    if (checkIn) { updates.push("checkIn = ?"); args.push(new Date(checkIn).toISOString()); }
    if (checkOut) { updates.push("checkOut = ?"); args.push(new Date(checkOut).toISOString()); }
    if (price) { updates.push("price = ?"); args.push(parseInt(price)); }
    if (status) { updates.push("status = ?"); args.push(status); }
    if (notes !== undefined) { updates.push("notes = ?"); args.push(notes || null); }
    
    updates.push("updatedAt = ?");
    args.push(now);

    if (updates.length > 0) {
      args.push(id);
      await db.execute({
        sql: `UPDATE Reservation SET ${updates.join(", ")} WHERE id = ?`,
        args,
      });
    }

    // Fetch updated reservation
    const result = await db.execute({
      sql: "SELECT * FROM Reservation WHERE id = ?",
      args: [id],
    });

    return NextResponse.json(result.rows[0]);
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
    await db.execute({
      sql: "DELETE FROM Reservation WHERE id = ?",
      args: [id],
    });
    return NextResponse.json({ message: "Reservasi berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/reservations/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus reservasi" }, { status: 500 });
  }
}

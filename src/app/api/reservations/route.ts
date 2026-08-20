import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { customAlphabet } from "nanoid";

const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 25);

// GET /api/reservations - List all reservations
export async function GET() {
  try {
    const result = await db.execute(
      "SELECT * FROM Reservation ORDER BY createdAt DESC"
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
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

    const id = generateId();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO Reservation (id, guestName, phone, roomType, roomNumber, checkIn, checkOut, price, status, invoiceNumber, notes, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        guestName,
        phone || null,
        roomType,
        roomNumber,
        checkInDate.toISOString(),
        checkOutDate.toISOString(),
        parseInt(price),
        "menunggu_pembayaran",
        null,
        notes || null,
        now,
        now,
      ],
    });

    // Fetch and return the created reservation
    const result = await db.execute({
      sql: "SELECT * FROM Reservation WHERE id = ?",
      args: [id],
    });

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("POST /api/reservations error:", error);
    return NextResponse.json({ 
      error: "Gagal membuat reservasi: " + (error?.message || "Unknown error")
    }, { status: 500 });
  }
}

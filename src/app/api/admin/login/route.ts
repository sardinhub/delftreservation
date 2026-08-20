import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

// POST /api/admin/login
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password harus diisi" },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: "SELECT * FROM Admin WHERE username = ?",
      args: [username],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = result.rows[0] as any;

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Create JWT session token
    const token = await createSessionToken({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
    });

    // Set httpOnly cookie
    await setSessionCookie(token);

    // Return admin info (without password)
    return NextResponse.json({
      message: "Login berhasil",
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/login error:", error);
    return NextResponse.json({ error: "Gagal login" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

// POST /api/admin/logout
export async function POST() {
  try {
    await clearSessionCookie();

    return NextResponse.json({ message: "Logout berhasil" });
  } catch (error) {
    console.error("POST /api/admin/logout error:", error);
    return NextResponse.json(
      { error: "Gagal logout" },
      { status: 500 }
    );
  }
}

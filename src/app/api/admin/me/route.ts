import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";

// GET /api/admin/me — Verify current session
export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { error: "Tidak ada sesi aktif" },
        { status: 401 }
      );
    }

    return NextResponse.json({ admin: session });
  } catch (error) {
    console.error("GET /api/admin/me error:", error);
    return NextResponse.json(
      { error: "Gagal memverifikasi sesi" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const [total, lunas, dp, menunggu, revenue, recent] = await Promise.all([
      db.execute("SELECT COUNT(*) as count FROM Reservation"),
      db.execute("SELECT COUNT(*) as count FROM Reservation WHERE status = 'lunas'"),
      db.execute("SELECT COUNT(*) as count FROM Reservation WHERE status = 'dp'"),
      db.execute("SELECT COUNT(*) as count FROM Reservation WHERE status = 'menunggu_pembayaran'"),
      db.execute("SELECT COALESCE(SUM(price), 0) as total FROM Reservation WHERE status = 'lunas'"),
      db.execute("SELECT * FROM Reservation ORDER BY createdAt DESC LIMIT 10"),
    ]);

    return NextResponse.json({
      stats: {
        total: Number(total.rows[0]?.count || 0),
        lunas: Number(lunas.rows[0]?.count || 0),
        dp: Number(dp.rows[0]?.count || 0),
        menunggu: Number(menunggu.rows[0]?.count || 0),
        totalRevenue: Number(revenue.rows[0]?.total || 0),
      },
      recent: recent.rows,
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

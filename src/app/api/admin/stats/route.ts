import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [total, lunas, dp, menunggu, revenue, recent] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: "lunas" } }),
      prisma.reservation.count({ where: { status: "dp" } }),
      prisma.reservation.count({ where: { status: "menunggu_pembayaran" } }),
      prisma.reservation.aggregate({ _sum: { price: true }, where: { status: "lunas" } }),
      prisma.reservation.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },

      }),
    ]);

    return NextResponse.json({
      stats: {
        total,
        lunas,
        dp,
        menunggu,
        totalRevenue: revenue._sum.price || 0,
      },
      recent,
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

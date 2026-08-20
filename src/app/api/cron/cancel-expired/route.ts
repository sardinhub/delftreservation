import { NextRequest, NextResponse } from "next/server";
import { cancelExpiredReservations } from "@/lib/cancel-expired";

// GET /api/cron/cancel-expired - Auto-cancel reservations older than 3 hours without payment
// Can be called by:
// 1. Vercel Cron Jobs (vercel.json)
// 2. External cron service like cron-job.org
// 3. Manual trigger
export async function GET(request: NextRequest) {
  // Verify cron secret (optional security)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cancelled = await cancelExpiredReservations();

  return NextResponse.json({
    message: `Auto-cancelled ${cancelled} expired reservation(s)`,
    cancelled,
    timestamp: new Date().toISOString(),
  });
}

import { prisma } from "@/lib/prisma";

/**
 * Cancel reservations that were approved more than 3 hours ago
 * but haven't been paid yet. This frees up rooms for new bookings.
 */
const PAYMENT_TIMEOUT_HOURS = 3;

export async function cancelExpiredReservations(): Promise<number> {
  try {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - PAYMENT_TIMEOUT_HOURS);

    // Find reservations that are approved/invoice_issued but expired
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: { in: ["approved", "invoice_issued"] },
        approvedAt: { not: null, lt: cutoffTime },
      },
      select: { id: true, guestName: true, guestPhone: true, room: { select: { name: true } } },
    });

    if (expiredReservations.length === 0) return 0;

    // Cancel all expired reservations
    await prisma.reservation.updateMany({
      where: {
        status: { in: ["approved", "invoice_issued"] },
        approvedAt: { not: null, lt: cutoffTime },
      },
      data: { status: "cancelled" },
    });

    console.log(
      `[AutoCancel] Cancelled ${expiredReservations.length} expired reservation(s):`,
      expiredReservations.map((r) => `${r.id} (${r.guestName} - ${r.room.name})`)
    );

    return expiredReservations.length;
  } catch (error) {
    console.error("[AutoCancel] Error cancelling expired reservations:", error);
    return 0;
  }
}

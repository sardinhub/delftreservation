import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/reservations/[id]/payment - Upload payment proof
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservasi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Allow payment upload for approved or invoice_issued status
    if (!["approved", "invoice_issued", "paid"].includes(reservation.status)) {
      return NextResponse.json(
        { error: `Pembayaran tidak dapat diunggah. Status: ${reservation.status}` },
        { status: 400 }
      );
    }

    const proof = formData.get("proof") as File | null;
    const bankName = formData.get("bankName") as string | null;
    const accountName = formData.get("accountName") as string | null;
    const amount = formData.get("amount") as string | null;
    const transferDate = formData.get("transferDate") as string | null;

    let proofData = "";
    let proofPath = "";

    if (proof && proof.size > 0) {
      // Convert file to base64 for Vercel-compatible storage
      const bytes = await proof.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = proof.name.split(".").pop() || "jpg";
      const mimeType = proof.type || `image/${ext}`;
      const base64 = buffer.toString("base64");
      proofData = `data:${mimeType};base64,${base64}`;
      proofPath = `proof-${Date.now()}.${ext}`;
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { reservationId: id },
    });

    let payment;
    if (existingPayment) {
      // Update existing payment
      payment = await prisma.payment.update({
        where: { reservationId: id },
        data: {
          ...(proofData && { proofData, proofImage: proofPath }),
          ...(bankName && { bankName }),
          ...(accountName && { accountName }),
          ...(amount && { amount: parseInt(amount) }),
          ...(transferDate && { transferDate: new Date(transferDate) }),
          verifiedByAdmin: false, // Reset verification on new upload
        },
      });
    } else {
      // Create new payment
      payment = await prisma.payment.create({
        data: {
          reservationId: id,
          amount: amount ? parseInt(amount) : reservation.totalPrice,
          proofData: proofData || null,
          proofImage: proofPath || null,
          bankName: bankName || null,
          accountName: accountName || null,
          transferDate: transferDate ? new Date(transferDate) : null,
        },
      });
    }

    // Update reservation status to paid
    await prisma.reservation.update({
      where: { id },
      data: { status: "paid" },
    });

    return NextResponse.json({
      message: "Bukti pembayaran berhasil diunggah",
      payment,
    });
  } catch (error) {
    console.error("POST /api/reservations/[id]/payment error:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah bukti pembayaran" },
      { status: 500 }
    );
  }
}

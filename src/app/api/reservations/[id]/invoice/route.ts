import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateInvoiceNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");
  return `INV-${date}-${random}`;
}

// POST /api/reservations/[id]/invoice - Generate invoice for lunas reservation
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({ where: { id } });

    if (!reservation) {
      return NextResponse.json({ error: "Reservasi tidak ditemukan" }, { status: 404 });
    }

    if (reservation.status !== "lunas") {
      return NextResponse.json(
        { error: "Invoice hanya bisa dibuat untuk reservasi berstatus LUNAS" },
        { status: 400 }
      );
    }

    if (reservation.invoiceNumber) {
      return NextResponse.json({
        message: "Invoice sudah ada",
        invoiceNumber: reservation.invoiceNumber,
      });
    }

    const invoiceNumber = generateInvoiceNumber();

    await prisma.reservation.update({
      where: { id },
      data: { invoiceNumber },
    });

    return NextResponse.json({
      message: "Invoice berhasil dibuat",
      invoiceNumber,
    });
  } catch (error) {
    console.error("POST /api/reservations/[id]/invoice error:", error);
    return NextResponse.json({ error: "Gagal membuat invoice" }, { status: 500 });
  }
}

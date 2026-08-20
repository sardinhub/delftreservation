"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import Image from "next/image";

interface InvoiceData {
  id: string;
  guestName: string;
  phone: string | null;
  roomType: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  price: number;
  status: string;
  dpAmount: number;
  invoiceNumber: string;
  notes: string | null;
  createdAt: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateNights(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const watermarkConfig: Record<string, { text: string; bgColor: string; textColor: string }> = {
  menunggu_pembayaran: { text: "RESERVASI", bgColor: "bg-blue-50", textColor: "text-blue-600" },
  dp: { text: "DOWN PAYMENT", bgColor: "bg-amber-50", textColor: "text-amber-600" },
  lunas: { text: "LUNAS", bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
};

const statusBadgeConfig: Record<string, { label: string; color: string; dot: string }> = {
  menunggu_pembayaran: { label: "MENUNGGU PEMBAYARAN", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  dp: { label: "DOWN PAYMENT", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  lunas: { label: "LUNAS", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/reservations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setInvoice(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleExportPDF = async () => {
    if (!invoiceRef.current || !invoice) return;
    setExporting(true);

    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const element = invoiceRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // A4 size in points: 595.28 x 841.89
      const pdfWidth = 595.28;
      const pdfHeight = 841.89;
      const margin = 20; // points

      const contentWidth = pdfWidth - margin * 2;
      const ratio = contentWidth / imgWidth;
      const contentHeight = imgHeight * ratio;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      // If content fits on one page
      if (contentHeight <= pdfHeight - margin * 2) {
        pdf.addImage(imgData, "PNG", margin, margin, contentWidth, contentHeight);
      } else {
        // Multi-page: slice the image
        const pageContentHeight = pdfHeight - margin * 2;
        const pageContentHeightPx = pageContentHeight / ratio;
        let yOffset = 0;
        let page = 0;

        while (yOffset < imgHeight) {
          if (page > 0) pdf.addPage();

          const sliceHeight = Math.min(pageContentHeightPx, imgHeight - yOffset);

          // Create a slice canvas
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = imgWidth;
          sliceCanvas.height = sliceHeight;
          const ctx = sliceCanvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(canvas, 0, yOffset, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight);
            const sliceData = sliceCanvas.toDataURL("image/png");
            const slicePdfHeight = sliceHeight * ratio;
            pdf.addImage(sliceData, "PNG", margin, margin, contentWidth, slicePdfHeight);
          }

          yOffset += pageContentHeightPx;
          page++;
        }
      }

      // Generate filename
      const filename = `Invoice-${invoice.invoiceNumber}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl mb-2">😕</p>
        <p className="text-gray-500">Invoice tidak ditemukan</p>
        <Link href="/admin/reservations" className="text-gold hover:underline text-sm mt-2 inline-block">
          ← Kembali
        </Link>
      </div>
    );
  }

  const nights = calculateNights(invoice.checkIn, invoice.checkOut);
  const today = formatDate(invoice.createdAt);
  const watermark = watermarkConfig[invoice.status] || watermarkConfig.menunggu_pembayaran;
  const badge = statusBadgeConfig[invoice.status] || statusBadgeConfig.menunggu_pembayaran;
  const isDP = invoice.status === "dp";
  const dpAmount = invoice.dpAmount || 0;
  const remainingBalance = invoice.price - dpAmount;

  return (
    <div className="bg-gray-100">
      {/* Action Buttons - fixed position, hidden on export */}
      <div className="fixed bottom-6 right-6 z-50 no-print flex items-center gap-3">
        <Link
          href={`/admin/reservations/${id}`}
          className="flex items-center gap-2 px-4 py-3 bg-white text-gray-700 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium active:scale-[0.98]"
        >
          ← Kembali
        </Link>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-3 bg-[#1a2744] text-white rounded-full shadow-lg hover:bg-[#16213e] transition-colors text-sm font-medium active:scale-[0.98] disabled:opacity-60"
        >
          {exporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Membuat PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </>
          )}
        </button>
      </div>

      {/* Invoice Document */}
      <div className="max-w-[700px] mx-auto py-4 px-3 sm:px-4">
        <div ref={invoiceRef} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

          {/* === HEADER === */}
          <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-gray-200">
            <div className="flex items-start justify-between gap-4">
              {/* Company Info - Logo */}
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-delft.jpg"
                  alt="Delft Apartment Logo"
                  width={48}
                  height={48}
                  className="rounded-lg object-contain"
                  priority
                />
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-[#1a2744] tracking-tight">DELFT APARTMENT</h1>
                  <p className="text-[10px] text-gray-400">Kawasan CPI Makassar</p>
                  <p className="text-[10px] text-gray-400">Telp: 0811-4128-05</p>
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="text-right flex-shrink-0">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.color} mb-2`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                  {badge.label}
                </div>
                <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Invoice</p>
                <p className="text-sm font-bold text-gray-900 font-mono">{invoice.invoiceNumber}</p>
                <p className="text-[9px] uppercase tracking-widest text-gray-400 mt-1 mb-0.5">Tanggal</p>
                <p className="text-[11px] text-gray-600">{today}</p>
              </div>
            </div>
          </div>

          {/* === BILL TO + KAMAR === */}
          <div className="px-5 sm:px-6 py-3 grid grid-cols-2 gap-4 border-b border-gray-100">
            {/* Bill To */}
            <div>
              <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1 font-semibold">Bill To</p>
              <p className="text-xs font-bold text-gray-900">{invoice.guestName}</p>
              {invoice.phone && (
                <p className="text-[11px] text-gray-500 mt-0.5">Telp: {invoice.phone}</p>
              )}
            </div>

            {/* Room Info */}
            <div>
              <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1 font-semibold">Kamar</p>
              <p className="text-xs font-semibold text-gray-900">
                {invoice.roomType} · Room {invoice.roomNumber}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {formatDateShort(invoice.checkIn)} → {formatDateShort(invoice.checkOut)} ({nights} malam)
              </p>
            </div>
          </div>

          {/* === LINE ITEMS TABLE === */}
          <div className="px-5 sm:px-6">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left py-2 font-semibold text-gray-500 uppercase tracking-wider text-[9px]">Deskripsi</th>
                  <th className="text-center py-2 font-semibold text-gray-500 uppercase tracking-wider text-[9px]">Qty</th>
                  <th className="text-right py-2 font-semibold text-gray-500 uppercase tracking-wider text-[9px]">Harga</th>
                  <th className="text-right py-2 font-semibold text-gray-500 uppercase tracking-wider text-[9px]">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2">
                    <p className="font-medium text-gray-900">Sewa Kamar {invoice.roomType}</p>
                    <p className="text-[10px] text-gray-400">Room {invoice.roomNumber}</p>
                  </td>
                  <td className="py-2 text-center text-gray-600">{nights}</td>
                  <td className="py-2 text-right text-gray-600">{formatPrice(invoice.price / nights)}</td>
                  <td className="py-2 text-right font-semibold text-gray-900">{formatPrice(invoice.price)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* === TOTALS === */}
          <div className="px-5 sm:px-6 py-3">
            <div className="ml-auto w-56">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(invoice.price)}</span>
                </div>

                {isDP && dpAmount > 0 && (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-amber-600">DP Dibayar</span>
                      <span className="text-amber-600 font-medium">-{formatPrice(dpAmount)}</span>
                    </div>
                    <div className="border-t border-dashed border-gray-300 pt-1.5">
                      <div className="flex justify-between">
                        <span className="text-[11px] font-bold text-gray-700 uppercase">Sisa Pembayaran</span>
                        <span className="text-sm font-bold text-gray-900">{formatPrice(remainingBalance)}</span>
                      </div>
                    </div>
                  </>
                )}

                {!isDP && (
                  <div className="border-t border-gray-200 pt-1.5">
                    <div className="flex justify-between">
                      <span className="text-[11px] font-bold text-gray-700 uppercase">Total</span>
                      <span className="text-base font-bold text-[#1a2744]">{formatPrice(invoice.price)}</span>
                    </div>
                  </div>
                )}

                {isDP && (
                  <div className="border-t border-gray-200 pt-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-gray-700 uppercase">Yang Dibayar</span>
                      <span className="text-base font-bold text-[#1a2744]">{formatPrice(remainingBalance)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* === NOTES === */}
          {invoice.notes && (
            <div className="px-5 sm:px-6 pb-3">
              <div className="bg-gray-50 rounded-md px-3 py-2 border border-gray-100">
                <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-0.5 font-semibold">Catatan</p>
                <p className="text-[11px] text-gray-600">{invoice.notes}</p>
              </div>
            </div>
          )}

          {/* === PAYMENT STATUS === */}
          <div className={`mx-5 sm:mx-6 mb-4 rounded-md px-3 py-2 flex items-center gap-2 ${watermark.bgColor} border ${invoice.status === "lunas" ? "border-emerald-200" : invoice.status === "dp" ? "border-amber-200" : "border-blue-200"}`}>
            <span className="text-sm">
              {invoice.status === "lunas" ? "✅" : invoice.status === "dp" ? "⏳" : "📋"}
            </span>
            <div className="flex-1">
              <p className={`text-[11px] font-bold ${watermark.textColor}`}>{watermark.text}</p>
              {isDP && (
                <p className="text-[10px] text-gray-500">DP: {formatPrice(dpAmount)} · Sisa: {formatPrice(remainingBalance)}</p>
              )}
            </div>
          </div>

          {/* === FOOTER === */}
          <div className="border-t border-gray-200 px-5 sm:px-6 py-2.5 bg-gray-50/80">
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-gray-400">Dicetak otomatis oleh sistem DELFT APARTMENT</p>
              <p className="text-[9px] text-gray-400">Terima kasih 🙏</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DELFT APARTMENT — Exclusive Living at CPI Makassar",
  description:
    "Reservasi apartemen eksklusif di kawasan CPI Makassar. 4 unit premium dengan layanan terbaik.",
  keywords: ["apartemen", "CPI Makassar", "reservasi", "hotel", "short stay"],
  openGraph: {
    title: "DELFT APARTMENT — CPI Makassar",
    description: "Apartemen eksklusif di kawasan CPI Makassar",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-navy">
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#1a2744",
  viewportFit: "cover",
};

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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DELFT APARTMENT",
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
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full min-h-dvh flex flex-col bg-cream text-navy">
        {children}
      </body>
    </html>
  );
}

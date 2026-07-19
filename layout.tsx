import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SPK Siswa Terbaik - SMK Karya Guna Bhakti 2 Kota Bekasi",
  description: "Sistem Pendukung Keputusan Penentuan Siswa Terbaik Menggunakan Metode Weighted Product (WP) Berbasis Website Pada SMK Karya Guna Bhakti 2 Kota Bekasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

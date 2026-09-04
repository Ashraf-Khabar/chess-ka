import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "../components/layout/Navbar";
import "./globals.css";

// Load Inter font for a clean, modern UI
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chess Pro Analyzer",
  description: "Advanced chess analysis and opening catalog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen flex flex-col`}>
        {/* Global Navigation Bar */}
        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-grow w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
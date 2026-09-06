import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Navbar from "@/features/components/layout/Navbar";
import MainShell from "@/features/components/layout/MainShell";
import AppProviders from "@/features/settings/components/AppProviders";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Chess Pro Analyzer",
  description: "Train with Stockfish, coach feedback, and game review",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-app-theme="signal"
      data-font="desk"
      data-color-scheme="light"
      suppressHydrationWarning
    >
      <body
        className={`${dmSans.variable} font-sans min-h-dvh flex flex-col antialiased`}
      >
        <AppProviders>
          <Navbar />
          <MainShell>{children}</MainShell>
        </AppProviders>
      </body>
    </html>
  );
}

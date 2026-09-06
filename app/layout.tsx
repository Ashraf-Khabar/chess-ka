import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppShell from "@/features/components/layout/AppShell";
import MainShell from "@/features/components/layout/MainShell";
import AppProviders from "@/features/settings/components/AppProviders";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
      data-app-theme="carbon"
      data-font="desk"
      data-color-scheme="dark"
      className="dark"
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} font-sans min-h-dvh antialiased`}
      >
        <AppProviders>
          <AppShell>
            <MainShell>{children}</MainShell>
          </AppShell>
        </AppProviders>
      </body>
    </html>
  );
}

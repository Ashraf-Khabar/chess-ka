import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  DM_Sans,
  Manrope,
  Fraunces,
  Space_Grotesk,
  Literata,
} from "next/font/google";
import Navbar from "@/features/components/layout/Navbar";
import MainShell from "@/features/components/layout/MainShell";
import AppProviders from "@/features/settings/components/AppProviders";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
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
        className={`${bricolage.variable} ${dmSans.variable} ${manrope.variable} ${fraunces.variable} ${spaceGrotesk.variable} ${literata.variable} font-sans min-h-dvh flex flex-col antialiased`}
      >
        <AppProviders>
          <Navbar />
          <MainShell>{children}</MainShell>
        </AppProviders>
      </body>
    </html>
  );
}

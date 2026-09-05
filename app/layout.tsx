import type { Metadata } from "next";
import {
  Outfit,
  Syne,
  Manrope,
  Fraunces,
  Space_Grotesk,
  Literata,
} from "next/font/google";
import Navbar from "@/features/components/layout/Navbar";
import MainShell from "@/features/components/layout/MainShell";
import AppProviders from "@/features/settings/components/AppProviders";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
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
  description: "Advanced chess analysis and opening catalog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-app-theme="atelier"
      data-font="studio"
      data-color-scheme="light"
      suppressHydrationWarning
    >
      <body
        className={`${outfit.variable} ${syne.variable} ${manrope.variable} ${fraunces.variable} ${spaceGrotesk.variable} ${literata.variable} font-sans min-h-dvh flex flex-col antialiased`}
      >
        <AppProviders>
          <Navbar />
          <MainShell>{children}</MainShell>
        </AppProviders>
      </body>
    </html>
  );
}

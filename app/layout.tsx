import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import AppShell from "@/features/components/layout/AppShell";
import MainShell from "@/features/components/layout/MainShell";
import AppProviders from "@/features/settings/components/AppProviders";
import "./globals.css";

/** Editorial display face — mastheads, evals, brand. */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

/** UI face — labels, body copy, controls. */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chess Pro Analyzer",
  description: "Train with Stockfish, coach feedback, and game review",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0908",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-app-theme="tournament"
      data-board-size="xl"
      data-color-scheme="dark"
      className={`${fraunces.variable} ${jakarta.variable} dark`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">
        <AppProviders>
          <AppShell>
            <MainShell>{children}</MainShell>
          </AppShell>
        </AppProviders>
      </body>
    </html>
  );
}

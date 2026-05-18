import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FaceMeshBg from "./components/FaceMeshBg";
import { LangProvider } from "./contexts/LangContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeepGuard — Forensic deepfake detection",
  description: "Drop in any video. Six neural models detect deepfakes with 97.3% accuracy.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Layer 0 — particle mesh */}
        <FaceMeshBg />

        {/* Layer 1 — radial vignette for depth */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(10,10,13,0.55) 100%)",
          }}
        />

        {/* Layer 2+ — page content */}
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}

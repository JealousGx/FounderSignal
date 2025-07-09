import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { TopLoader } from "@/components/shared/top-loader";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FounderSignal",
    template: `%s | FounderSignal`,
  },
  description:
    "A real-time micro-validation platform for startup founders to test startup ideas within 72 hours — powered by dynamic MVPs, user feedback, and AI summaries.",
  robots: { index: true, follow: true },
  icons: {
    icon: "/assets/favicon/favicon.ico",
    shortcut: "/assets/favicon/favicon-16x16.png",
    apple: "/assets/favicon/apple-touch-icon.png",
  },
  manifest: `/assets/favicon/site.webmanifest`,
  authors: [
    {
      name: "JealousGx",
      url: "https://jealous.dev",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <TopLoader />

          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}

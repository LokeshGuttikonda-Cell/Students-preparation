import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Students-preparation",
  description:
    "Interview and placement preparation: topic-wise MCQ practice, timed mock tests and weak-area analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh bg-surface text-text antialiased">
        {children}
      </body>
    </html>
  );
}

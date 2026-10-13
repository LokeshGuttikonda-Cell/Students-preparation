import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Students-preparation",
  description:
    "Interview and placement preparation: topic-wise MCQ practice, timed mock tests and weak-area analysis.",
};

import { AuthProvider } from "../context/AuthContext";
import { FeedbackTriggerListener } from "../components/feedback/FeedbackTriggerListener";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-dvh bg-surface text-text antialiased">
        <AuthProvider>
          {children}
          <FeedbackTriggerListener />
        </AuthProvider>
      </body>
    </html>
  );
}

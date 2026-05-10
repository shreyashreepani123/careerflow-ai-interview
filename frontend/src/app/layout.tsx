import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AnimatedBackground } from "@/components/AnimatedBackground";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "CareerFlow | High-Fidelity AI Interview & Proctoring",
  description: "Next-gen AI video interview platform with real-time gaze tracking and Groq-powered question generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased min-h-screen relative`}>
        <AnimatedBackground />
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}


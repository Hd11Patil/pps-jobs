import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PPS Jobs - Empowering Careers, Connecting Talent",
  description: "India's leading job portal connecting employers with the best talent. Find your dream job or hire top candidates with PPS Jobs.",
  keywords: ["PPS Jobs", "Job Portal", "Find Jobs", "Hire Talent", "Career", "Recruitment", "India"],
  authors: [{ name: "Mr. Shivam Pathak" }],
  openGraph: {
    title: "PPS Jobs - Empowering Careers, Connecting Talent",
    description: "Find your dream job or hire top talent with India's leading job portal.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

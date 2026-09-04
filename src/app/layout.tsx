import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cherry Ops — Red Cherry Interactive",
  description: "Agency operating system for Red Cherry Interactive",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}

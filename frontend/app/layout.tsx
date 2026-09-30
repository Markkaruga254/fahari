import "./globals.css";
import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans, Space_Grotesk, Space_Mono } from "next/font/google";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-display",
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-mono",
});

const editorial = Newsreader({
  subsets: ["latin"],
  style: "italic",
  weight: "400",
  display: "swap",
  variable: "--font-editorial",
});

export const metadata: Metadata = {
  title: "People's Priorities",
  description: "Explainable constituency priority intelligence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${display.variable} ${bodyFont.variable} ${mono.variable} ${editorial.variable}`}
    >
      <body className="bg-obsidian font-body text-sand antialiased">{children}</body>
    </html>
  );
}

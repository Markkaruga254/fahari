import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "People's Priorities",
  description: "Explainable constituency priority intelligence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

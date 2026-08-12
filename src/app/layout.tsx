import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AmakTech Connect",
  description:
    "Connecting Businesses, Empowering Commerce.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

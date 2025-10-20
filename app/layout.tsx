import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BluffBets Blackjack",
  description: "Play Blackjack with Web3 Integration",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

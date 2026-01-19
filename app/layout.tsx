import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Human Company",
  description: "Humans won't judge intelligence. They'll define the work that creates it.",
  openGraph: {
    title: "Human Company",
    description: "Humans won't judge intelligence. They'll define the work that creates it.",
    url: "https://thehumancompany.ai",
    siteName: "Human Company",
    images: [
      {
        url: "/og-image.png",
        width: 2400,
        height: 1260,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Human Company",
    description: "Humans won't judge intelligence. They'll define the work that creates it.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-[#f5f5f0] text-[#1a1a1a]`}
      >
        {children}
      </body>
    </html>
  );
}

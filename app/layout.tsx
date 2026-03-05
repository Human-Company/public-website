import type { Metadata } from "next";
import { Albert_Sans, Hedvig_Letters_Serif } from "next/font/google";
import "./globals.css";

const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
});

const hedvigSerif = Hedvig_Letters_Serif({
  weight: "400",
  variable: "--font-hedvig-letters-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Human Company",
  description: "RL gyms for agent training",
  openGraph: {
    title: "Human Company",
    description: "RL gyms for agent training",
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
    description: "RL gyms for agent training",
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
        className={`${albertSans.variable} ${hedvigSerif.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
      </body>
    </html>
  );
}

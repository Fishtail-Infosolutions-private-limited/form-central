import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const playfair = Playfair_Display({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Origin Foundation | Mithila Queen",
    template: "%s | The Origin Foundation",
  },
  description:
    "The Origin Foundation — Rooted in Identity. Driven by Purpose. Presenting Mithila Queen: Celebrating Mithila's Culture, Confidence & Talent in Janakpur Dham, Nepal.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans selection:bg-[#7F1D2D] selection:text-[#FFFDF7] bg-[#FFFDF7] text-[#292524]">
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
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
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans selection:bg-[var(--color-brand-primary)] selection:text-white bg-[var(--color-brand-surface)] text-[var(--color-brand-text)]">
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}

import React from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { PageTransition } from "@/components/animation/page-transition";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-[#292524] selection:bg-[#7F1D2D] selection:text-[#FFFDF7]">
      <PublicNavbar />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <PublicFooter />
    </div>
  );
}

import React from "react";
import { getCurrentAdmin } from "@/lib/auth/guards";
import { HomeClient } from "@/components/home/home-client";

export const metadata = {
  title: "Form Central — Event & Registration Platform",
  description:
    "Unified registration and dynamic form management system for competitions, hackathons, sports events, workshops, and participant logistics.",
};

export default async function HomePage() {
  const admin = await getCurrentAdmin();

  return (
    <HomeClient
      admin={
        admin
          ? {
              id: admin.id,
              email: admin.email,
            }
          : null
      }
    />
  );
}

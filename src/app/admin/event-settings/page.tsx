import React from "react";
import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { getSiteSettingsAction } from "@/server/actions/site-settings-actions";
import { EventSettingsWorkspace } from "@/components/admin/event-settings/event-settings-workspace";

export const metadata: Metadata = {
  title: "Event Settings | The Origin Foundation Admin",
  description: "Manage competition details, audition guidelines, dates, venue, FAQs, and public presentation.",
};

export default async function AdminEventSettingsPage() {
  await requireAdmin();

  const settingsRes = await getSiteSettingsAction();
  const setting = settingsRes.success ? settingsRes.setting : null;

  return <EventSettingsWorkspace initialSetting={setting} />;
}


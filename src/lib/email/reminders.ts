import { prisma } from "@/lib/db/prisma";
import { CampaignStatus, FormStatus } from "@prisma/client";
import { createAndEnqueueCampaign } from "./queue";
import { DEFAULT_EMAIL_TEMPLATES } from "./templates/default-templates";

export interface ReminderConfig {
  daysBefore: number;
  flagKey: "enableReminder7Days" | "enableReminder3Days" | "enableReminder1Day" | "enableReminderEventDay";
  templateName: string;
  nameSuffix: string;
  targetHourNpt: number; // e.g. 8 for 8:00 AM NPT
}

export const REMINDER_CONFIGS: ReminderConfig[] = [
  {
    daysBefore: 7,
    flagKey: "enableReminder7Days",
    templateName: "Event Reminder",
    nameSuffix: "7-Day Event Reminder",
    targetHourNpt: 8,
  },
  {
    daysBefore: 3,
    flagKey: "enableReminder3Days",
    templateName: "Event Reminder",
    nameSuffix: "3-Day Event Reminder",
    targetHourNpt: 8,
  },
  {
    daysBefore: 1,
    flagKey: "enableReminder1Day",
    templateName: "Event Tomorrow",
    nameSuffix: "1-Day Event Reminder (Tomorrow)",
    targetHourNpt: 8,
  },
  {
    daysBefore: 0,
    flagKey: "enableReminderEventDay",
    templateName: "Event Tomorrow",
    nameSuffix: "Event Day Reminder",
    targetHourNpt: 5,
  },
];

/**
 * Synchronizes scheduled event reminder campaigns for a given form.
 * Ensures automated reminders match the current event date, cancels outdated reminders,
 * and creates new scheduled campaigns for enabled reminders.
 */
export async function syncEventRemindersForForm(formId: string) {
  const form = await prisma.registrationForm.findUnique({
    where: { id: formId },
  });

  if (!form) return;

  const now = new Date();

  // If form is closed or has no eventDate or eventDate is in the past, cancel pending scheduled reminders
  if (form.status === FormStatus.CLOSED || !form.eventDate || form.eventDate <= now) {
    await prisma.emailCampaign.updateMany({
      where: {
        formId,
        name: { contains: "Event Reminder" },
        status: CampaignStatus.SCHEDULED,
      },
      data: {
        status: CampaignStatus.CANCELLED,
      },
    });
    return;
  }

  // Iterate over the 4 reminder types
  for (const config of REMINDER_CONFIGS) {
    const isEnabled = form[config.flagKey];
    const campaignName = `${form.name} – ${config.nameSuffix}`;

    // Target scheduled date: eventDate minus X days
    const eventTime = form.eventDate.getTime();
    const targetScheduledTime = new Date(eventTime - config.daysBefore * 24 * 60 * 60 * 1000);

    const existingCampaign = await prisma.emailCampaign.findFirst({
      where: {
        formId,
        name: campaignName,
      },
    });

    if (!isEnabled) {
      // If disabled and still scheduled, cancel it
      if (existingCampaign && existingCampaign.status === CampaignStatus.SCHEDULED) {
        await prisma.emailCampaign.update({
          where: { id: existingCampaign.id },
          data: { status: CampaignStatus.CANCELLED },
        });
      }
      continue;
    }

    // If enabled:
    if (existingCampaign) {
      // If still scheduled, update scheduledAt in case eventDate changed
      if (existingCampaign.status === CampaignStatus.SCHEDULED) {
        await prisma.emailCampaign.update({
          where: { id: existingCampaign.id },
          data: {
            scheduledAt: targetScheduledTime,
          },
        });
      }
    } else if (targetScheduledTime > now) {
      // Create new scheduled campaign
      const defaultTpl = DEFAULT_EMAIL_TEMPLATES.find((t) => t.name === config.templateName);
      const subject = defaultTpl?.subject || `Important Reminder: ${form.name}`;
      const content = defaultTpl?.bodyHtml || `<p>Hello {{participant_name}}, this is a reminder for {{event_name}}.</p>`;

      const templateRecord = await prisma.emailTemplate.findFirst({
        where: { name: config.templateName },
      });

      await createAndEnqueueCampaign({
        name: campaignName,
        formId: form.id,
        templateId: templateRecord?.id,
        subject,
        content,
        criteria: {
          type: "ALL",
          excludeUnsubscribed: true,
        },
        scheduledAt: targetScheduledTime,
      });
    }
  }
}

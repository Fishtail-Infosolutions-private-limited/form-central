import { PrismaClient } from "@prisma/client";

export interface DefaultTemplateDefinition {
  name: string;
  category: "ANNOUNCEMENT" | "REMINDER" | "CONFIRMATION" | "STATUS_UPDATE" | "CUSTOM";
  subject: string;
  bodyText: string;
  bodyHtml: string;
}

export const DEFAULT_EMAIL_TEMPLATES: DefaultTemplateDefinition[] = [
  {
    name: "Event Date Announcement",
    category: "ANNOUNCEMENT",
    subject: "Important Announcement – {{event_name}}",
    bodyText: `Hello {{participant_name}},

We are pleased to announce that {{event_name}} will take place on {{event_date}}.

Event details:
- Event: {{event_name}}
- Date: {{event_date}}
- Time: {{event_time}}
- Venue: {{event_venue}}

We look forward to seeing you!

Regards,
{{organizer_name}}`,
    bodyHtml: `<p>Hello <strong>{{participant_name}}</strong>,</p>
<p>We are pleased to announce that <strong>{{event_name}}</strong> will take place on <strong>{{event_date}}</strong>.</p>
<div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
  <p style="margin: 0 0 8px 0; font-weight: 700; color: #065f46; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Official Event Details</p>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr><td style="padding: 4px 0; color: #64748b; width: 30%;">Event:</td><td style="font-weight: 600; color: #0f172a;">{{event_name}}</td></tr>
    <tr><td style="padding: 4px 0; color: #64748b;">Date:</td><td style="font-weight: 600; color: #0f172a;">{{event_date}}</td></tr>
    <tr><td style="padding: 4px 0; color: #64748b;">Time:</td><td style="font-weight: 600; color: #0f172a;">{{event_time}}</td></tr>
    <tr><td style="padding: 4px 0; color: #64748b;">Venue:</td><td style="font-weight: 600; color: #0f172a;">{{event_venue}}</td></tr>
  </table>
</div>
<p>We look forward to seeing you at the starting line!</p>
<p>Regards,<br/><strong>{{organizer_name}}</strong></p>`,
  },
  {
    name: "Event Reminder",
    category: "REMINDER",
    subject: "Reminder: {{event_name}} is Coming Soon!",
    bodyText: `Hello {{participant_name}},

This is a reminder that {{event_name}} is approaching.

Event Date: {{event_date}}
Event Time: {{event_time}}
Venue: {{event_venue}}

Please make sure to arrive on time and follow the event instructions.

We look forward to seeing you!

Regards,
{{organizer_name}}`,
    bodyHtml: `<p>Hello <strong>{{participant_name}}</strong>,</p>
<p>This is a friendly reminder that <strong>{{event_name}}</strong> is approaching soon!</p>
<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
  <h4 style="margin: 0 0 12px 0; color: #059669; font-size: 13px; text-transform: uppercase;">Event Schedule & Location</h4>
  <p style="margin: 4px 0;"><strong>Date:</strong> {{event_date}}</p>
  <p style="margin: 4px 0;"><strong>Time:</strong> {{event_time}}</p>
  <p style="margin: 4px 0;"><strong>Venue:</strong> {{event_venue}}</p>
</div>
<p>Please make sure to arrive on time and adhere to all participant guidelines.</p>
<p>Regards,<br/><strong>{{organizer_name}}</strong></p>`,
  },
  {
    name: "Event Tomorrow",
    category: "REMINDER",
    subject: "Tomorrow – {{event_name}}",
    bodyText: `Hello {{participant_name}},

Tomorrow is the big day! {{event_name}} takes place tomorrow.

Event Details:
- Date: {{event_date}}
- Reporting Time: {{event_time}}
- Venue: {{event_venue}}
- Registration ID: {{registration_id}}

Important Instructions:
- Arrive at least 45 minutes prior to reporting time.
- Bring your official Photo ID and Registration ID: {{registration_id}}.
- Collect your bib and timing chip at the verification desk.

We look forward to seeing you!

Regards,
{{organizer_name}}`,
    bodyHtml: `<p>Hello <strong>{{participant_name}}</strong>,</p>
<p style="font-size: 16px; color: #059669; font-weight: 700;">Tomorrow is the big day!</p>
<p><strong>{{event_name}}</strong> takes place tomorrow. Please review your check-in instructions below:</p>
<div style="background-color: #0f172a; color: #ffffff; border-radius: 10px; padding: 20px; margin: 20px 0;">
  <div style="font-size: 12px; color: #34d399; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">Your Entry Pass</div>
  <div style="font-size: 18px; font-weight: 800; font-family: monospace;">Registration ID: {{registration_id}}</div>
  <div style="margin-top: 12px; font-size: 13px; color: #cbd5e1; border-top: 1px solid #334155; padding-top: 10px;">
    Reporting Time: <strong>{{event_time}}</strong> &bull; Venue: <strong>{{event_venue}}</strong>
  </div>
</div>
<h4 style="color: #0f172a; font-size: 14px; margin: 20px 0 8px 0;">Important Check-In Instructions:</h4>
<ul style="color: #475569; font-size: 14px; line-height: 1.6; padding-left: 20px; margin: 0 0 20px 0;">
  <li>Please arrive at least 45 minutes before the reporting time.</li>
  <li>Carry an official ID along with your Registration ID (<strong>{{registration_id}}</strong>).</li>
  <li>Collect your bib and timing chip at the verification tent.</li>
</ul>
<p>We look forward to welcoming you!</p>
<p>Regards,<br/><strong>{{organizer_name}}</strong></p>`,
  },
  {
    name: "Registration Confirmation",
    category: "CONFIRMATION",
    subject: "Registration Confirmed – {{event_name}}",
    bodyText: `Hello {{participant_name}},

Thank you for registering for {{event_name}}.

Your registration has been successfully received.

Registration Details:
- Registration ID: {{registration_id}}
- Event: {{event_name}}
- Name: {{participant_name}}
- Email: {{participant_email}}
- Category: {{participant_category}}
- Date: {{current_date}}
- Status: Confirmed

Please keep your registration ID for future reference.

Thank you!
{{organizer_name}}`,
    bodyHtml: `<p>Hello <strong>{{participant_name}}</strong>,</p>
<p>Thank you for registering for <strong>{{event_name}}</strong>. Your registration has been successfully received and recorded.</p>
<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
  <h4 style="margin: 0 0 12px 0; color: #059669; font-size: 13px; text-transform: uppercase;">Registration Summary</h4>
  <p style="margin: 4px 0;"><strong>Registration ID:</strong> <span style="font-family: monospace; font-weight: 700;">{{registration_id}}</span></p>
  <p style="margin: 4px 0;"><strong>Event:</strong> {{event_name}}</p>
  <p style="margin: 4px 0;"><strong>Participant:</strong> {{participant_name}}</p>
  <p style="margin: 4px 0;"><strong>Email:</strong> {{participant_email}}</p>
  <p style="margin: 4px 0;"><strong>Category:</strong> {{participant_category}}</p>
  <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: 700;">Confirmed</span></p>
</div>
<p>Please keep your Registration ID handy for bib collection and official event inquiries.</p>
<p>Best regards,<br/><strong>{{organizer_name}}</strong></p>`,
  },
  {
    name: "Registration Approved",
    category: "STATUS_UPDATE",
    subject: "Your Registration Has Been Approved! – {{event_name}}",
    bodyText: `Hello {{participant_name}},

Great news! Your registration for {{event_name}} has been officially reviewed and APPROVED.

Details:
- Registration ID: {{registration_id}}
- Event: {{event_name}}
- Category: {{participant_category}}
- Date: {{event_date}}
- Venue: {{event_venue}}

We look forward to seeing you at the event.

Regards,
{{organizer_name}}`,
    bodyHtml: `<p>Hello <strong>{{participant_name}}</strong>,</p>
<div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
  <h3 style="color: #065f46; margin: 0 0 4px 0; font-size: 16px;">Registration Officially Approved!</h3>
  <p style="color: #047857; margin: 0; font-size: 13px;">Your entry credentials for {{event_name}} have been verified and approved.</p>
</div>
<p>Here are your confirmed entry details:</p>
<ul style="color: #334155; font-size: 14px; line-height: 1.8;">
  <li><strong>Registration ID:</strong> <span style="font-family: monospace;">{{registration_id}}</span></li>
  <li><strong>Event:</strong> {{event_name}}</li>
  <li><strong>Category:</strong> {{participant_category}}</li>
  <li><strong>Event Date:</strong> {{event_date}}</li>
  <li><strong>Venue:</strong> {{event_venue}}</li>
</ul>
<p>Further instructions regarding timing chip pickup and bib number will be shared closer to the event date.</p>
<p>Regards,<br/><strong>{{organizer_name}}</strong></p>`,
  },
  {
    name: "Registration Rejected",
    category: "STATUS_UPDATE",
    subject: "Registration Update – {{event_name}}",
    bodyText: `Hello {{participant_name}},

Thank you for your interest in {{event_name}}.

Following a review of your registration submission (Registration ID: {{registration_id}}), we regret to inform you that we are unable to approve your entry at this time.

This may be due to incomplete documentation, qualification requirements, or category capacity limits.

If you have questions or believe this was in error, please reach out to our organizing team.

Regards,
{{organizer_name}}`,
    bodyHtml: `<p>Hello <strong>{{participant_name}}</strong>,</p>
<p>Thank you for submitting your registration for <strong>{{event_name}}</strong> (ID: <span style="font-family: monospace;">{{registration_id}}</span>).</p>
<p>After careful review of your entry details and documentation, we regret to inform you that your registration could not be approved at this time.</p>
<div style="background-color: #fff1f2; border-left: 4px solid #f43f5e; padding: 14px; margin: 18px 0; border-radius: 0 8px 8px 0;">
  <p style="color: #9f1239; margin: 0; font-size: 13px; line-height: 1.5;">
    Common reasons include incomplete identification documents, race category prerequisites not met, or maximum participant capacity reached.
  </p>
</div>
<p>If you have any questions or wish to submit updated documentation, please contact our support desk.</p>
<p>Best regards,<br/><strong>{{organizer_name}}</strong></p>`,
  },
  {
    name: "Event Venue / Schedule Update",
    category: "ANNOUNCEMENT",
    subject: "Important Update – {{event_name}}",
    bodyText: `Hello {{participant_name}},

Please take note of an important update regarding {{event_name}}.

Updated Event Information:
- Event: {{event_name}}
- Updated Date: {{event_date}}
- Updated Time: {{event_time}}
- Updated Venue: {{event_venue}}

Please plan your arrival accordingly.

For more details, visit: {{event_url}}

Regards,
{{organizer_name}}`,
    bodyHtml: `<p>Hello <strong>{{participant_name}}</strong>,</p>
<p>Please take note of an important schedule or venue update regarding <strong>{{event_name}}</strong>:</p>
<div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
  <h4 style="margin: 0 0 10px 0; color: #b45309; font-size: 14px; text-transform: uppercase;">Updated Event Schedule</h4>
  <p style="margin: 4px 0; color: #78350f;"><strong>Updated Date:</strong> {{event_date}}</p>
  <p style="margin: 4px 0; color: #78350f;"><strong>Updated Time:</strong> {{event_time}}</p>
  <p style="margin: 4px 0; color: #78350f;"><strong>Updated Venue:</strong> {{event_venue}}</p>
</div>
<p>Please update your calendar and plan your transportation accordingly. We apologize for any inconvenience.</p>
<p>Regards,<br/><strong>{{organizer_name}}</strong></p>`,
  },
  {
    name: "Custom Announcement",
    category: "CUSTOM",
    subject: "Official Announcement – {{event_name}}",
    bodyText: `Hello {{participant_name}},

We have an important announcement regarding {{event_name}}:

[Insert your announcement message here]

Event Details:
- Event: {{event_name}}
- Date: {{event_date}}
- Venue: {{event_venue}}
- Registration ID: {{registration_id}}

Thank you for being part of {{event_name}}!

Regards,
{{organizer_name}}`,
    bodyHtml: `<p>Hello <strong>{{participant_name}}</strong>,</p>
<p>We have an important announcement regarding <strong>{{event_name}}</strong>:</p>
<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
  <p style="color: #1e293b; margin: 0; line-height: 1.6;">
    [Insert your announcement message here]
  </p>
</div>
<p><strong>Registration ID:</strong> <span style="font-family: monospace;">{{registration_id}}</span></p>
<p>Thank you for participating!</p>
<p>Regards,<br/><strong>{{organizer_name}}</strong></p>`,
  },
];

export async function ensureDefaultEmailTemplates(prisma: PrismaClient) {
  for (const tpl of DEFAULT_EMAIL_TEMPLATES) {
    const existing = await prisma.emailTemplate.findFirst({
      where: { name: tpl.name },
    });
    if (!existing) {
      await prisma.emailTemplate.create({
        data: {
          name: tpl.name,
          category: tpl.category,
          subject: tpl.subject,
          bodyText: tpl.bodyText,
          bodyHtml: tpl.bodyHtml,
          isSystem: true,
        },
      });
    }
  }
}

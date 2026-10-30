/**
 * Dynamic Email Variables Engine
 * Handles variable substitution, escaping, placeholder datasets, and variable validation.
 */

export interface EmailVariableDefinition {
  key: string;
  label: string;
  description: string;
  sampleValue: string;
  group: "participant" | "competition" | "organization" | "links";
}

export const AVAILABLE_EMAIL_VARIABLES: EmailVariableDefinition[] = [
  // Participant Variables
  {
    key: "participant_name",
    label: "Participant Name",
    description: "Full legal name of the registered candidate",
    sampleValue: "Pooja Mishra",
    group: "participant",
  },
  {
    key: "participant_email",
    label: "Participant Email",
    description: "Verified registered email address",
    sampleValue: "pooja.mishra@example.com",
    group: "participant",
  },
  {
    key: "registration_id",
    label: "Registration ID",
    description: "Unique Mithila Queen reference number",
    sampleValue: "MQ-2026-8942",
    group: "participant",
  },
  {
    key: "participant_category",
    label: "Participant Category",
    description: "Candidate competition category",
    sampleValue: "Mithila Queen Crown Contestant",
    group: "participant",
  },

  // Competition Variables
  {
    key: "event_name",
    label: "Competition Name",
    description: "Official flagship competition title",
    sampleValue: "Mithila Queen 2026",
    group: "competition",
  },
  {
    key: "event_date",
    label: "Event Date",
    description: "Official event date (e.g. November 15, 2026)",
    sampleValue: "November 15, 2026",
    group: "competition",
  },
  {
    key: "event_time",
    label: "Event Time",
    description: "Reporting time in Nepal Standard Time (UTC+05:45)",
    sampleValue: "08:00 AM NPT",
    group: "competition",
  },
  {
    key: "event_venue",
    label: "Event Venue",
    description: "Official venue and stage hall",
    sampleValue: "Janakpur Dham Cultural Center, Nepal",
    group: "competition",
  },
  {
    key: "event_location",
    label: "Event Location",
    description: "City and district location",
    sampleValue: "Janakpur Dham, Dhanusha, Nepal",
    group: "competition",
  },
  {
    key: "event_description",
    label: "Competition Description",
    description: "Celebrating Mithila's Culture, Confidence & Talent",
    sampleValue: "Celebrating Mithila's Culture, Confidence & Talent.",
    group: "competition",
  },

  // Organization Variables
  {
    key: "organizer_name",
    label: "Organizer Name",
    description: "Host foundation and organizing secretariat",
    sampleValue: "The Origin Foundation",
    group: "organization",
  },

  // Links & Other Variables
  {
    key: "registration_url",
    label: "Registration URL",
    description: "Public link to the Mithila Queen registration portal",
    sampleValue: "https://theoriginfoundation.org/register/mithila-queen",
    group: "links",
  },
  {
    key: "event_url",
    label: "Competition URL",
    description: "Official competition portal website URL",
    sampleValue: "https://theoriginfoundation.org/mithila-queen",
    group: "links",
  },
  {
    key: "current_date",
    label: "Current Date",
    description: "Date of sending in Nepal Time",
    sampleValue: "October 30, 2026",
    group: "links",
  },
  {
    key: "unsubscribe_url",
    label: "Unsubscribe URL",
    description: "Secure one-click link to manage email preferences",
    sampleValue: "https://theoriginfoundation.org/unsubscribe?token=sample-preview-token",
    group: "links",
  },
];

export interface EmailRenderContext {
  participant_name?: string | null;
  participant_email?: string | null;
  registration_id?: string | null;
  event_name?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  event_venue?: string | null;
  event_location?: string | null;
  event_description?: string | null;
  participant_category?: string | null;
  organizer_name?: string | null;
  registration_url?: string | null;
  event_url?: string | null;
  current_date?: string | null;
  unsubscribe_url?: string | null;
  [key: string]: string | null | undefined;
}

/**
 * Escapes HTML characters in dynamic strings to prevent XSS / HTML injection.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Builds default sample preview context
 */
export function getSamplePreviewContext(overrides?: Partial<EmailRenderContext>): EmailRenderContext {
  const context: EmailRenderContext = {};
  for (const item of AVAILABLE_EMAIL_VARIABLES) {
    context[item.key] = item.sampleValue;
  }
  return { ...context, ...overrides };
}

/**
 * Replaces {{variable_name}} tokens in a template string.
 * Escapes user values if isHtml is true.
 */
export function renderEmailTemplate(
  templateContent: string,
  context: EmailRenderContext,
  options: { isHtml?: boolean } = {}
): string {
  if (!templateContent) return "";

  return templateContent.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (_match, varKey) => {
    const rawVal = context[varKey];
    if (rawVal === undefined || rawVal === null || rawVal === "") {
      return "";
    }
    const stringVal = String(rawVal);
    return options.isHtml ? escapeHtml(stringVal) : stringVal;
  });
}

/**
 * Validates template content for unknown variables or unclosed braces.
 */
export function validateTemplateVariables(text: string): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const knownKeys = new Set(AVAILABLE_EMAIL_VARIABLES.map((v) => v.key));

  const matches = text.matchAll(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g);
  for (const match of matches) {
    const key = match[1];
    if (!knownKeys.has(key)) {
      warnings.push(`Unknown variable "{{${key}}}". It might not be replaced at send time.`);
    }
  }

  // Detect unclosed brackets like {{participant_name
  if (/\{\{[^}]*$/.test(text) || /[^{]*\}\}/.test(text.replace(/\{\{[^}]*\}\}/g, ""))) {
    warnings.push("Detected mismatched or unclosed '{{' or '}}' brackets.");
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}


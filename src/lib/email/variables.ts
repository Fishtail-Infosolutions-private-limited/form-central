/**
 * Dynamic Email Variables Engine
 * Handles variable substitution, escaping, placeholder datasets, and variable validation.
 */

export interface EmailVariableDefinition {
  key: string;
  label: string;
  description: string;
  sampleValue: string;
}

export const AVAILABLE_EMAIL_VARIABLES: EmailVariableDefinition[] = [
  {
    key: "participant_name",
    label: "Participant Name",
    description: "Full legal name of the registered participant",
    sampleValue: "Bibek Poudel",
  },
  {
    key: "participant_email",
    label: "Participant Email",
    description: "Verified registered email address",
    sampleValue: "bibekpoudel@fishtailinfosolutions.com",
  },
  {
    key: "registration_id",
    label: "Registration ID",
    description: "Unique event registration reference number",
    sampleValue: "FC-2026-X8Y7Z",
  },
  {
    key: "event_name",
    label: "Event Name",
    description: "Name of the competition or event form",
    sampleValue: "Pokhara City Run 2026",
  },
  {
    key: "event_date",
    label: "Event Date",
    description: "Official event date (e.g. November 15, 2026)",
    sampleValue: "November 15, 2026",
  },
  {
    key: "event_time",
    label: "Event Time",
    description: "Event or reporting time in Nepal Standard Time",
    sampleValue: "06:30 AM NPT",
  },
  {
    key: "event_venue",
    label: "Event Venue",
    description: "Event venue or reporting location",
    sampleValue: "Pokhara Rangashala Ground, Kaski",
  },
  {
    key: "event_location",
    label: "Event Location",
    description: "City or region of the event",
    sampleValue: "Pokhara, Nepal",
  },
  {
    key: "event_description",
    label: "Event Description",
    description: "Short description of the event",
    sampleValue: "The premier running event of Gandaki Province.",
  },
  {
    key: "participant_category",
    label: "Participant Category",
    description: "Selected race distance or competition category",
    sampleValue: "21K Half Marathon Championship",
  },
  {
    key: "organizer_name",
    label: "Organizer Name",
    description: "Event organizing committee or application name",
    sampleValue: "Pokhara Athletics Association & FormSuite",
  },
  {
    key: "registration_url",
    label: "Registration URL",
    description: "Public link to the registration form page",
    sampleValue: "http://localhost:3000/register/pokhara-city-run-2026",
  },
  {
    key: "event_url",
    label: "Event URL",
    description: "Official event portal URL",
    sampleValue: "http://localhost:3000/register/pokhara-city-run-2026",
  },
  {
    key: "current_date",
    label: "Current Date",
    description: "Date of sending (e.g. October 30, 2026)",
    sampleValue: "October 30, 2026",
  },
  {
    key: "unsubscribe_url",
    label: "Unsubscribe URL",
    description: "Secure one-click link to manage email preferences",
    sampleValue: "http://localhost:3000/unsubscribe?token=sample-preview-token",
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


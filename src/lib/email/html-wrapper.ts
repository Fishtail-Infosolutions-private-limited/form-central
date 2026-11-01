import { escapeHtml } from "./variables";

export interface HtmlEmailOptions {
  eventTitle: string;
  badgeText?: string;
  bodyHtml: string;
  unsubscribeUrl?: string;
  showUnsubscribe?: boolean;
}

/**
 * Generates an email client-compatible (Gmail, Outlook, Apple Mail) responsive HTML document
 * styled with The Origin Foundation's Charcoal, Warm Ivory, and Antique Gold design system.
 */
export function wrapInFormSuiteEmailLayout({
  eventTitle,
  badgeText = "Official Notice",
  bodyHtml,
  unsubscribeUrl,
  showUnsubscribe = true,
}: HtmlEmailOptions): string {
  const safeEventTitle = escapeHtml(eventTitle || "The Origin Foundation");
  const safeBadgeText = escapeHtml(badgeText || "Official Notice");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeEventTitle}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, li, blockquote { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F7F1E5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #292524;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F7F1E5; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFDF7; border: 1px solid #EADBCE; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner (Maroon & Saffron Gold) -->
          <tr>
            <td style="background-color: #7F1D2D; padding: 28px 24px; text-align: center;">
              <h1 style="color: #FFFDF7; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px; line-height: 1.2;">
                ${safeEventTitle}
              </h1>
              <p style="color: #B89150; font-size: 11px; font-weight: 700; margin: 8px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px;">
                ${safeBadgeText}
              </p>
            </td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 32px 28px; font-size: 14px; line-height: 1.7; color: #292524;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="background-color: #F7F1E5; padding: 20px 28px; text-align: center; border-top: 1px solid #EADBCE;">
              <p style="color: #7F1D2D; font-size: 12px; margin: 0 0 8px 0; font-weight: 600;">
                The Origin Foundation &bull; Mithila Queen Official Secretariat
              </p>
              ${
                showUnsubscribe && unsubscribeUrl
                  ? `
                <p style="color: #78716C; font-size: 11px; margin: 0; line-height: 1.5;">
                  You received this email as a registered participant. 
                  <a href="${escapeHtml(unsubscribeUrl)}" style="color: #D97706; text-decoration: underline; font-weight: 600;">
                    Manage email preferences or unsubscribe
                  </a>.
                </p>
              `
                  : `
                <p style="color: #78716C; font-size: 11px; margin: 0; line-height: 1.5;">
                  This is an essential event communication sent to verified participants.
                </p>
              `
              }
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}


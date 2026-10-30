import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

export function getEmailTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || "neosparknepal@gmail.com";
  const pass = process.env.SMTP_PASSWORD || "ewwavewqxwyoswyt";

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

export async function sendOtpVerificationEmail({
  to,
  recipientName,
  otpCode,
  formName,
  expiresInMinutes = 10,
}: {
  to: string;
  recipientName: string;
  otpCode: string;
  formName: string;
  expiresInMinutes?: number;
}) {
  const mailer = getEmailTransporter();
  const fromName = process.env.EMAIL_FROM_NAME || "FormSuite";
  const fromEmail = process.env.EMAIL_FROM || "neosparknepal@gmail.com";

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `Your Registration Verification Code: ${otpCode} - ${formName}`,
    text: `Hello ${recipientName},\n\nYour 6-digit verification code for registering in "${formName}" is: ${otpCode}\n\nThis code will expire in ${expiresInMinutes} minutes. If you did not request this, please ignore this email.\n\nBest regards,\n${formName} Organizing Committee`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">${formName}</h1>
          <p style="color: #34d399; font-size: 13px; font-weight: 600; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Official Registration Verification</p>
        </div>
        
        <div style="padding: 32px 28px;">
          <p style="color: #334155; font-size: 15px; line-height: 1.5; margin: 0 0 16px 0;">Hello <strong>${recipientName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            Thank you for registering for <strong>${formName}</strong>. To verify your email address and continue to the next registration step, please enter the one-time code below:
          </p>
          
          <div style="text-align: center; margin: 28px 0; background-color: #f8fafc; border: 2px dashed #059669; border-radius: 10px; padding: 20px;">
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #059669; font-family: monospace;">
              ${otpCode}
            </div>
            <p style="color: #64748b; font-size: 12px; margin: 8px 0 0 0;">
              Valid for <strong>${expiresInMinutes} minutes</strong>
            </p>
          </div>
          
          <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 24px 0 0 0;">
            If you did not request this verification code, please disregard this email. This email verification is required only for event registration and does not create an online account.
          </p>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">
            Form Central &bull; Competition & Event Registration System &bull; Automated System Notice
          </p>
        </div>
      </div>
    `,
  };

  return mailer.sendMail(mailOptions);
}

export async function sendParticipantEmailNotice({
  to,
  recipientName,
  formName,
  subject,
  messageText,
}: {
  to: string;
  recipientName: string;
  formName: string;
  subject: string;
  messageText: string;
}) {
  const mailer = getEmailTransporter();
  const fromName = process.env.EMAIL_FROM_NAME || "Form Central";
  const fromEmail = process.env.EMAIL_FROM || "neosparknepal@gmail.com";

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `${subject} — ${formName}`,
    text: `Hello ${recipientName},\n\n${messageText}\n\nBest regards,\n${formName} Organizing Team`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #000000; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">${formName}</h1>
          <p style="color: #10b981; font-size: 12px; font-weight: 700; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Official Registration Update</p>
        </div>
        
        <div style="padding: 32px 28px;">
          <p style="color: #18181b; font-size: 15px; line-height: 1.5; margin: 0 0 16px 0;">Hello <strong>${recipientName}</strong>,</p>
          <div style="color: #3f3f46; font-size: 14px; line-height: 1.7; white-space: pre-wrap; margin: 0 0 24px 0;">
${messageText}
          </div>
          
          <div style="border-top: 1px solid #e4e4e7; padding-top: 16px; margin-top: 24px;">
            <p style="color: #71717a; font-size: 12px; margin: 0;">
              Best regards,<br/>
              <strong>${formName} Organizing Committee</strong>
            </p>
          </div>
        </div>
        
        <div style="background-color: #fafafa; padding: 14px 24px; text-align: center; border-top: 1px solid #e4e4e7;">
          <p style="color: #a1a1aa; font-size: 11px; margin: 0;">
            Sent by Form Central &bull; Competition & Event Registration System
          </p>
        </div>
      </div>
    `,
  };

  return mailer.sendMail(mailOptions);
}


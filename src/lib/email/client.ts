import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

export function getEmailTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || "originfoundation107@gmail.com";
  const pass = process.env.SMTP_PASSWORD || "";

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
  const fromName = process.env.EMAIL_FROM_NAME || "The Origin Foundation";
  const fromEmail = process.env.EMAIL_FROM || "originfoundation107@gmail.com";

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `Your Registration Verification Code: ${otpCode} - ${formName}`,
    text: `Hello ${recipientName},\n\nYour 6-digit verification code for registering in "${formName}" is: ${otpCode}\n\nThis code will expire in ${expiresInMinutes} minutes. If you did not request this, please ignore this email.\n\nBest regards,\n${formName} Organizing Committee`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0A192F; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">${formName}</h1>
          <p style="color: #C5A880; font-size: 13px; font-weight: 600; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Official Registration Verification</p>
        </div>
        
        <div style="padding: 32px 28px;">
          <p style="color: #334155; font-size: 15px; line-height: 1.5; margin: 0 0 16px 0;">Hello <strong>${recipientName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            Thank you for registering for <strong>${formName}</strong>. To verify your email address and continue to the next registration step, please enter the one-time code below:
          </p>
          
          <div style="text-align: center; margin: 28px 0; background-color: #f8fafc; border: 2px dashed #0A192F; border-radius: 10px; padding: 20px;">
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0A192F; font-family: monospace;">
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
            The Origin Foundation &bull; Competition & Event Registration System &bull; Automated System Notice
          </p>
        </div>
      </div>
    `,
  };

  return mailer.sendMail(mailOptions);
}

// ==========================================
// THE ORIGIN FOUNDATION & MITHILA QUEEN
// BRANDED TRANSACTIONAL EMAILS
// ==========================================

export async function sendMithilaQueenSubmissionEmail({
  to,
  fullName,
  registrationId,
  feeAmount = 399,
  paymentPageUrl,
}: {
  to: string;
  fullName: string;
  registrationId: string;
  feeAmount?: number;
  paymentPageUrl: string;
}) {
  const mailer = getEmailTransporter();
  const fromName = "The Origin Foundation";
  const fromEmail = process.env.EMAIL_FROM || "originfoundation107@gmail.com";

  return mailer.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `Application Received – Mithila Queen (${registrationId})`,
    text: `Hello ${fullName},\n\nThank you for submitting your application for Mithila Queen.\n\nYour Registration ID is: ${registrationId}\n\nNext Step: Please complete the NPR ${feeAmount} registration fee payment and upload your transaction reference and screenshot.\n\nPayment Link: ${paymentPageUrl}\n\nWith cultural pride,\nThe Origin Foundation\nJanakpur Dham, Nepal`,
    html: `
      <div style="font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FDFBF7; border: 1px solid #E9E2D5; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #0A192F; padding: 28px 24px; text-align: center; border-bottom: 3px solid #C5A880;">
          <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 800; margin: 0;">Mithila Queen</h1>
          <p style="color: #C5A880; font-size: 13px; font-weight: 600; margin: 6px 0 0 0; letter-spacing: 1px;">THE ORIGIN FOUNDATION • JANAKPUR DHAM</p>
        </div>
        <div style="padding: 32px 28px; color: #0A192F;">
          <p style="font-size: 15px; margin: 0 0 16px 0;">Hello <strong>${fullName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #243B53; margin: 0 0 24px 0;">
            Thank you for applying to participate in <strong>Mithila Queen</strong>. Your registration has been safely received by our organizing desk.
          </p>
          <div style="background-color: #FFFFFF; border: 1px solid #E9E2D5; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #71717a; text-transform: uppercase; font-weight: bold;">Registration ID</p>
            <p style="margin: 0; font-size: 22px; font-weight: 800; color: #0A192F; font-family: monospace;">${registrationId}</p>
            <p style="margin: 12px 0 0 0; font-size: 12px; color: #243B53;">
              Registration Fee: <strong>NPR ${feeAmount}</strong> (Nepalese Rupees)
            </p>
          </div>
          <div style="background-color: #F8F9FA; border-left: 4px solid #C5A880; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
            <p style="font-size: 13px; font-weight: bold; color: #0A192F; margin: 0 0 4px 0;">Next Step: Submit Payment Verification</p>
            <p style="font-size: 12px; color: #243B53; margin: 0; line-height: 1.5;">
              To advance your application to review, scan the official QR code, complete the NPR ${feeAmount} payment, and upload your transaction reference and screenshot.
            </p>
          </div>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${paymentPageUrl}" style="background-color: #C5A880; color: #0A192F; text-decoration: none; font-size: 13px; font-weight: 800; padding: 14px 32px; border-radius: 10px; display: inline-block;">
              Complete Payment Details
            </a>
          </div>
        </div>
        <div style="background-color: #0A192F; padding: 16px 24px; text-align: center; color: #E9E2D5; font-size: 11px;">
          The Origin Foundation &bull; Janakpur Dham, Nepal &bull; originfoundation107@gmail.com
        </div>
      </div>
    `,
  });
}

export async function sendMithilaQueenApprovalEmail({
  to,
  fullName,
  registrationId,
  pdfBuffer,
}: {
  to: string;
  fullName: string;
  registrationId: string;
  pdfBuffer: Uint8Array;
}) {
  const mailer = getEmailTransporter();
  const fromName = "The Origin Foundation";
  const fromEmail = process.env.EMAIL_FROM || "originfoundation107@gmail.com";

  return mailer.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `Application Approved & Confirmed – Mithila Queen (${registrationId})`,
    text: `Hello ${fullName},\n\nCongratulations! Your application and payment for Mithila Queen have been verified and approved by The Origin Foundation.\n\nYour official Registration Confirmation PDF is attached to this email.\n\nPlease keep this document safe for event verification.\n\nBest regards,\nThe Origin Foundation\nJanakpur Dham, Nepal`,
    attachments: [
      {
        filename: `Mithila-Queen-Confirmation-${registrationId}.pdf`,
        content: Buffer.from(pdfBuffer),
        contentType: "application/pdf",
      },
    ],
    html: `
      <div style="font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FDFBF7; border: 1px solid #E9E2D5; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #0A192F; padding: 28px 24px; text-align: center; border-bottom: 3px solid #C5A880;">
          <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 800; margin: 0;">Mithila Queen</h1>
          <p style="color: #C5A880; font-size: 13px; font-weight: 600; margin: 6px 0 0 0; letter-spacing: 1px;">THE ORIGIN FOUNDATION • OFFICIAL CONFIRMATION</p>
        </div>
        <div style="padding: 32px 28px; color: #0A192F;">
          <p style="font-size: 15px; margin: 0 0 16px 0;">Hello <strong>${fullName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #243B53; margin: 0 0 24px 0;">
            Congratulations! Your registration application and payment for <strong>Mithila Queen</strong> have been independently verified and officially approved by the organizing committee.
          </p>
          <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
            <p style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #15803d; margin: 0 0 4px 0;">Official Registration ID</p>
            <p style="font-size: 24px; font-weight: 800; color: #0A192F; margin: 0; font-family: monospace;">${registrationId}</p>
            <p style="font-size: 12px; color: #166534; font-weight: 600; margin: 8px 0 0 0;">STATUS: APPROVED & CONFIRMED</p>
          </div>
          <p style="font-size: 13px; color: #243B53; line-height: 1.6; margin: 0 0 16px 0;">
            Your official branded <strong>Registration Confirmation PDF</strong> is attached to this email. Please download and retain this document for attendance verification and official announcements.
          </p>
          <div style="background-color: #F8F9FA; border-left: 4px solid #0A192F; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
            <p style="font-size: 12px; color: #243B53; margin: 0; line-height: 1.5;">
              <strong>Video Audition Reminder:</strong> Please record your introduction video and send it directly via WhatsApp to Managing Director Gaurav Gupta at <strong>+977 9704571941</strong>.
            </p>
          </div>
        </div>
        <div style="background-color: #0A192F; padding: 16px 24px; text-align: center; color: #E9E2D5; font-size: 11px;">
          The Origin Foundation &bull; Janakpur Dham, Nepal &bull; originfoundation107@gmail.com
        </div>
      </div>
    `,
  });
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
  const fromName = process.env.EMAIL_FROM_NAME || "The Origin Foundation";
  const fromEmail = process.env.EMAIL_FROM || "originfoundation107@gmail.com";

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `${subject} - ${formName}`,
    text: `Hello ${recipientName},\n\n${messageText}\n\nBest regards,\n${formName} Organizing Team`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0A192F; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">${formName}</h1>
          <p style="color: #C5A880; font-size: 12px; font-weight: 700; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Official Registration Update</p>
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
            Sent by The Origin Foundation &bull; Competition & Event Registration System
          </p>
        </div>
      </div>
    `,
  };

  return mailer.sendMail(mailOptions);
}

export async function sendAdminPasswordResetEmail({
  to,
  otpCode,
  expiresInMinutes = 10,
}: {
  to: string;
  otpCode: string;
  expiresInMinutes?: number;
}) {
  const mailer = getEmailTransporter();
  const fromName = process.env.EMAIL_FROM_NAME || "The Origin Foundation";
  const fromEmail = process.env.EMAIL_FROM || "originfoundation107@gmail.com";

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `Admin Password Reset Code: ${otpCode} - Origin Foundation`,
    text: `Hello Administrator,\n\nA request was initiated to reset your Origin Foundation administrator password.\n\nYour 6-digit verification code is: ${otpCode}\n\nThis code will expire in ${expiresInMinutes} minutes. If you did not make this request, please ensure your account credentials are secure.\n\nBest regards,\nOrigin Foundation Security Desk`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0A192F; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">The Origin Foundation</h1>
          <p style="color: #C5A880; font-size: 12px; font-weight: 700; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Administrator Password Recovery</p>
        </div>
        
        <div style="padding: 32px 28px;">
          <p style="color: #18181b; font-size: 15px; line-height: 1.5; margin: 0 0 16px 0;">Hello Administrator,</p>
          <p style="color: #52525b; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0;">
            A password reset was requested for your <strong>Origin Foundation</strong> administrator account. To verify your identity and set a new password, enter the 6-digit code below:
          </p>
          
          <div style="text-align: center; margin: 24px 0; background-color: #f4fdf8; border: 2px dashed #0A192F; border-radius: 12px; padding: 20px;">
            <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0A192F; font-family: monospace;">
              ${otpCode}
            </div>
            <p style="color: #64748b; font-size: 12px; margin: 8px 0 0 0;">
              Valid for <strong>${expiresInMinutes} minutes</strong>
            </p>
          </div>
          
          <p style="color: #71717a; font-size: 12px; line-height: 1.5; margin: 24px 0 0 0;">
            If you did not request this password reset, please ignore this email or review your security settings.
          </p>
        </div>
        
        <div style="background-color: #f4f4f5; padding: 14px 24px; text-align: center; border-top: 1px solid #e4e4e7;">
          <p style="color: #a1a1aa; font-size: 11px; margin: 0;">
            The Origin Foundation &bull; Janakpur Dham, Nepal &bull; Automated Security Notice
          </p>
        </div>
      </div>
    `,
  };

  return mailer.sendMail(mailOptions);
}

export async function sendRegistrationConfirmationEmail({
  to,
  participantName,
  eventTitle,
  referenceNumber,
  submissionDate,
  status = "Confirmed",
  viewDetailsUrl,
}: {
  to: string;
  participantName: string;
  eventTitle: string;
  referenceNumber: string;
  submissionDate: string;
  status?: string;
  viewDetailsUrl?: string;
}) {
  const mailer = getEmailTransporter();
  const fromName = process.env.EMAIL_FROM_NAME || "The Origin Foundation";
  const fromEmail = process.env.EMAIL_FROM || "originfoundation107@gmail.com";

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `Registration Successful – ${eventTitle}`,
    text: `Hello ${participantName},\n\nThank you for registering for ${eventTitle}.\n\nYour registration has been successfully received.\n\nRegistration Details:\n- Registration ID: ${referenceNumber}\n- Event: ${eventTitle}\n- Name: ${participantName}\n- Email: ${to}\n- Registration Date: ${submissionDate}\n- Status: ${status}\n\nPlease keep your registration ID for future reference.\n\nThank you!\n${eventTitle} Organizing Team`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #0A192F; padding: 28px 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">${eventTitle}</h1>
          <p style="color: #C5A880; font-size: 12px; font-weight: 700; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px;">Registration Confirmed</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 28px;">
          <p style="color: #18181b; font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">Hello ${participantName},</p>
          <p style="color: #52525b; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            Thank you for registering for <strong>${eventTitle}</strong>. Your official entry has been successfully received and recorded in our system.
          </p>

          <!-- Registration Details Card -->
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
            <h3 style="color: #0A192F; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
              Official Registration Details
            </h3>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #71717a; width: 40%; font-weight: 500;">Registration ID:</td>
                <td style="padding: 6px 0; color: #0A192F; font-family: monospace; font-weight: 800; font-size: 14px;">${referenceNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #71717a; font-weight: 500;">Event / Competition:</td>
                <td style="padding: 6px 0; color: #18181b; font-weight: 700;">${eventTitle}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #71717a; font-weight: 500;">Participant Name:</td>
                <td style="padding: 6px 0; color: #18181b; font-weight: 600;">${participantName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #71717a; font-weight: 500;">Registered Email:</td>
                <td style="padding: 6px 0; color: #18181b;">${to}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #71717a; font-weight: 500;">Submission Date:</td>
                <td style="padding: 6px 0; color: #18181b;">${submissionDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #71717a; font-weight: 500;">Status:</td>
                <td style="padding: 6px 0;">
                  <span style="background-color: #d1fae5; color: #065f46; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase;">
                    ${status}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fdf8f6; border-left: 4px solid #C5A880; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
            <p style="color: #0A192F; font-size: 12px; margin: 0; line-height: 1.5;">
              <strong>Important:</strong> Please retain your Registration ID (<strong>${referenceNumber}</strong>) for attendance, entry check-in, and official event inquiries.
            </p>
          </div>

          ${
            viewDetailsUrl
              ? `
            <div style="text-align: center; margin-top: 24px;">
              <a href="${viewDetailsUrl}" style="display: inline-block; background-color: #0A192F; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 8px;">
                View Event Page
              </a>
            </div>
          `
              : ""
          }
        </div>

        <!-- Footer -->
        <div style="background-color: #f4f4f5; padding: 16px 28px; text-align: center; border-top: 1px solid #e4e4e7;">
          <p style="color: #71717a; font-size: 11px; margin: 0; line-height: 1.5;">
            This is an automated confirmation notice sent by The Origin Foundation. If you have questions, please reach out to originfoundation107@gmail.com.
          </p>
        </div>
      </div>
    `,
  };

  return mailer.sendMail(mailOptions);
}

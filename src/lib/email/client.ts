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

// ==========================================
// REGISTRATION OTP EMAIL
// ==========================================
export async function sendOtpVerificationEmail({
  to,
  recipientName = "Participant",
  otpCode,
  formName = "Mithila Queen",
  expiresInMinutes = 10,
}: {
  to: string;
  recipientName?: string;
  otpCode: string;
  formName?: string;
  expiresInMinutes?: number;
}) {
  const mailer = getEmailTransporter();
  const fromName = process.env.EMAIL_FROM_NAME || "The Origin Foundation";
  const fromEmail = process.env.EMAIL_FROM || "originfoundation107@gmail.com";

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `Your Registration Verification Code: ${otpCode} - ${formName}`,
    text: `Hello ${recipientName},\n\nYour 6-digit verification code for "${formName}" is: ${otpCode}\n\nThis code will expire in ${expiresInMinutes} minutes. If you did not request this, please ignore this email.\n\nBest regards,\nThe Origin Foundation\nJanakpur Dham, Nepal`,
    html: `
      <div style="font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background-color: #F3F1ED; border: 1px solid #DCD8D1; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #5C5751; padding: 24px; text-align: center; border-bottom: 2px solid #5C5751;">
          <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 0;">${formName}</h1>
          <p style="color: #5C5751; font-size: 12px; font-weight: 600; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">The Origin Foundation &bull; Janakpur Dham</p>
        </div>
        
        <div style="padding: 32px 28px; background-color: #FFFFFF;">
          <p style="color: #5C5751; font-size: 15px; line-height: 1.5; margin: 0 0 16px 0;">Hello <strong>${recipientName}</strong>,</p>
          <p style="color: #292824; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            Thank you for registering for <strong>${formName}</strong>. To verify your email address and continue with your application, enter the one-time code below:
          </p>
          
          <div style="text-align: center; margin: 24px 0; background-color: #F3F1ED; border: 2px dashed #5C5751; border-radius: 10px; padding: 20px;">
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #5C5751; font-family: monospace;">
              ${otpCode}
            </div>
            <p style="color: #71717a; font-size: 12px; margin: 8px 0 0 0;">
              Valid for <strong>${expiresInMinutes} minutes</strong>
            </p>
          </div>
          
          <p style="color: #71717a; font-size: 12px; line-height: 1.5; margin: 24px 0 0 0;">
            If you did not request this verification code, please disregard this email.
          </p>
        </div>
        
        <div style="background-color: #5C5751; padding: 14px 24px; text-align: center;">
          <p style="color: #DCD8D1; font-size: 11px; margin: 0;">
            The Origin Foundation &bull; Janakpur Dham, Nepal &bull; originfoundation107@gmail.com
          </p>
        </div>
      </div>
    `,
  };

  return mailer.sendMail(mailOptions);
}

// ==========================================
// MITHILA QUEEN STATUS ACCESS OTP EMAIL
// ==========================================
export async function sendMithilaQueenStatusOtpEmail({
  to,
  recipientName = "Participant",
  otpCode,
  expiresInMinutes = 10,
}: {
  to: string;
  recipientName?: string;
  otpCode: string;
  expiresInMinutes?: number;
}) {
  const mailer = getEmailTransporter();
  const fromName = "The Origin Foundation";
  const fromEmail = process.env.EMAIL_FROM || "originfoundation107@gmail.com";

  return mailer.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `Application Status Access Code: ${otpCode} - Mithila Queen`,
    text: `Hello ${recipientName},\n\nYour 6-digit verification code to access your Mithila Queen application dossier and status is: ${otpCode}\n\nThis code will expire in ${expiresInMinutes} minutes.\n\nBest regards,\nThe Origin Foundation\nJanakpur Dham, Nepal`,
    html: `
      <div style="font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 580px; margin: 0 auto; background-color: #F3F1ED; border: 1px solid #DCD8D1; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #5C5751; padding: 24px; text-align: center; border-bottom: 2px solid #5C5751;">
          <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 0;">Mithila Queen</h1>
          <p style="color: #5C5751; font-size: 12px; font-weight: 600; margin: 4px 0 0 0; text-transform: uppercase;">Secure Status & Dossier Access</p>
        </div>
        
        <div style="padding: 32px 28px; background-color: #FFFFFF;">
          <p style="color: #5C5751; font-size: 15px; margin: 0 0 16px 0;">Hello <strong>${recipientName}</strong>,</p>
          <p style="color: #292824; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            A request was made to view or update your registered Mithila Queen application. Enter the one-time code below to verify ownership:
          </p>
          
          <div style="text-align: center; margin: 24px 0; background-color: #F3F1ED; border: 2px dashed #5C5751; border-radius: 10px; padding: 20px;">
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #5C5751; font-family: monospace;">
              ${otpCode}
            </div>
            <p style="color: #71717a; font-size: 12px; margin: 8px 0 0 0;">
              Valid for <strong>${expiresInMinutes} minutes</strong>
            </p>
          </div>
          
          <p style="color: #71717a; font-size: 12px; margin: 20px 0 0 0;">
            If you did not request this code, no one can view your private application details without this verification code.
          </p>
        </div>
        
        <div style="background-color: #5C5751; padding: 14px 24px; text-align: center;">
          <p style="color: #DCD8D1; font-size: 11px; margin: 0;">
            The Origin Foundation &bull; Janakpur Dham, Nepal &bull; originfoundation107@gmail.com
          </p>
        </div>
      </div>
    `,
  });
}

// ==========================================
// SUBMISSION RECEIVED EMAIL
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
      <div style="font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F3F1ED; border: 1px solid #DCD8D1; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #5C5751; padding: 28px 24px; text-align: center; border-bottom: 3px solid #5C5751;">
          <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 800; margin: 0;">Mithila Queen</h1>
          <p style="color: #5C5751; font-size: 13px; font-weight: 600; margin: 6px 0 0 0; letter-spacing: 1px;">THE ORIGIN FOUNDATION • JANAKPUR DHAM</p>
        </div>
        <div style="padding: 32px 28px; color: #5C5751; background-color: #FFFFFF;">
          <p style="font-size: 15px; margin: 0 0 16px 0;">Hello <strong>${fullName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #292824; margin: 0 0 24px 0;">
            Thank you for applying to participate in <strong>Mithila Queen</strong>. Your registration application has been safely received by our organizing desk.
          </p>
          <div style="background-color: #F3F1ED; border: 1px solid #DCD8D1; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #71717a; text-transform: uppercase; font-weight: bold;">Registration ID</p>
            <p style="margin: 0; font-size: 22px; font-weight: 800; color: #5C5751; font-family: monospace;">${registrationId}</p>
            <p style="margin: 12px 0 0 0; font-size: 12px; color: #292824;">
              Registration Fee: <strong>NPR ${feeAmount}</strong> (Nepalese Rupees)
            </p>
          </div>
          <div style="background-color: #F3F1ED; border-left: 4px solid #5C5751; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
            <p style="font-size: 13px; font-weight: bold; color: #5C5751; margin: 0 0 4px 0;">Next Step: Submit Payment Verification</p>
            <p style="font-size: 12px; color: #292824; margin: 0; line-height: 1.5;">
              To advance your application to review, scan the official QR code, complete the NPR ${feeAmount} payment, and upload your transaction reference and screenshot.
            </p>
          </div>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${paymentPageUrl}" style="background-color: #5C5751; color: #5C5751; text-decoration: none; font-size: 13px; font-weight: 800; padding: 14px 32px; border-radius: 6px; display: inline-block;">
              Complete Payment Details
            </a>
          </div>
        </div>
        <div style="background-color: #5C5751; padding: 16px 24px; text-align: center; color: #DCD8D1; font-size: 11px;">
          The Origin Foundation &bull; Janakpur Dham, Nepal &bull; originfoundation107@gmail.com
        </div>
      </div>
    `,
  });
}

// ==========================================
// APPROVAL & CONFIRMATION EMAIL (PDF ATTACHED)
// ==========================================
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
      <div style="font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F3F1ED; border: 1px solid #DCD8D1; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #5C5751; padding: 28px 24px; text-align: center; border-bottom: 3px solid #5C5751;">
          <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 800; margin: 0;">Mithila Queen</h1>
          <p style="color: #5C5751; font-size: 13px; font-weight: 600; margin: 6px 0 0 0; letter-spacing: 1px;">THE ORIGIN FOUNDATION • OFFICIAL CONFIRMATION</p>
        </div>
        <div style="padding: 32px 28px; color: #5C5751; background-color: #FFFFFF;">
          <p style="font-size: 15px; margin: 0 0 16px 0;">Hello <strong>${fullName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #292824; margin: 0 0 24px 0;">
            Congratulations! Your registration application and payment for <strong>Mithila Queen</strong> have been independently verified and officially approved by the organizing committee.
          </p>
          <div style="background-color: #F3F1ED; border: 1px solid #5C5751; border-radius: 10px; padding: 20px; margin-bottom: 24px; text-align: center;">
            <p style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #D97706; margin: 0 0 4px 0;">Official Registration ID</p>
            <p style="font-size: 24px; font-weight: 800; color: #5C5751; margin: 0; font-family: monospace;">${registrationId}</p>
            <p style="font-size: 12px; color: #5C5751; font-weight: 600; margin: 8px 0 0 0;">STATUS: APPROVED & CONFIRMED</p>
          </div>
          <p style="font-size: 13px; color: #292824; line-height: 1.6; margin: 0 0 16px 0;">
            Your official branded <strong>Registration Confirmation PDF</strong> is attached to this email. Please download and retain this document for attendance verification and official announcements.
          </p>
          <div style="background-color: #F3F1ED; border-left: 4px solid #5C5751; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
            <p style="font-size: 12px; color: #292824; margin: 0; line-height: 1.5;">
              <strong>Video Audition Reminder:</strong> Please record your introduction video and send it directly via WhatsApp to Managing Director Gaurav Gupta at <strong>+977 9704571941</strong>.
            </p>
          </div>
        </div>
        <div style="background-color: #5C5751; padding: 16px 24px; text-align: center; color: #DCD8D1; font-size: 11px;">
          The Origin Foundation &bull; Janakpur Dham, Nepal &bull; originfoundation107@gmail.com
        </div>
      </div>
    `,
  });
}

// ==========================================
// DETAILS UPDATED CONFIRMATION EMAIL
// ==========================================
export async function sendMithilaQueenDetailsUpdatedEmail({
  to,
  recipientName,
  registrationId,
  updatedFieldsList,
}: {
  to: string;
  recipientName: string;
  registrationId: string;
  updatedFieldsList: string[];
}) {
  const mailer = getEmailTransporter();
  const fromName = "The Origin Foundation";
  const fromEmail = process.env.EMAIL_FROM || "originfoundation107@gmail.com";

  return mailer.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `Application Details Updated – Mithila Queen (${registrationId})`,
    text: `Hello ${recipientName},\n\nYour application details for Mithila Queen (${registrationId}) have been successfully updated.\n\nUpdated fields: ${updatedFieldsList.join(", ")}\n\nBest regards,\nThe Origin Foundation\nJanakpur Dham, Nepal`,
    html: `
      <div style="font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 580px; margin: 0 auto; background-color: #F3F1ED; border: 1px solid #DCD8D1; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #5C5751; padding: 24px; text-align: center; border-bottom: 2px solid #5C5751;">
          <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 800; margin: 0;">Mithila Queen</h1>
          <p style="color: #5C5751; font-size: 12px; font-weight: 600; margin: 4px 0 0 0; text-transform: uppercase;">Application Details Modified</p>
        </div>
        
        <div style="padding: 30px 26px; background-color: #FFFFFF;">
          <p style="color: #5C5751; font-size: 15px; margin: 0 0 14px 0;">Hello <strong>${recipientName}</strong>,</p>
          <p style="color: #292824; font-size: 13.5px; line-height: 1.6; margin: 0 0 20px 0;">
            This email confirms that your participant information for registration <strong>${registrationId}</strong> was successfully updated.
          </p>
          
          <div style="background-color: #F3F1ED; border: 1px solid #DCD8D1; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #D97706; margin: 0 0 6px 0;">Modified Categories</p>
            <ul style="margin: 0; padding-left: 20px; font-size: 12.5px; color: #5C5751;">
              ${updatedFieldsList.map((f) => `<li>${f}</li>`).join("")}
            </ul>
          </div>
          
          <p style="color: #71717a; font-size: 12px; margin: 0;">
            If you did not make these changes, please notify our organizing secretariat immediately at originfoundation107@gmail.com or WhatsApp +977 9704571941.
          </p>
        </div>
        
        <div style="background-color: #5C5751; padding: 14px 24px; text-align: center;">
          <p style="color: #DCD8D1; font-size: 11px; margin: 0;">
            The Origin Foundation &bull; Janakpur Dham, Nepal
          </p>
        </div>
      </div>
    `,
  });
}

// ==========================================
// PAYMENT RECEIPT CONFIRMATION EMAIL
// ==========================================
export async function sendMithilaQueenPaymentReceivedEmail({
  to,
  recipientName,
  registrationId,
  transactionRef,
}: {
  to: string;
  recipientName: string;
  registrationId: string;
  transactionRef: string;
}) {
  const mailer = getEmailTransporter();
  const fromName = "The Origin Foundation";
  const fromEmail = process.env.EMAIL_FROM || "originfoundation107@gmail.com";

  return mailer.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `Payment Receipt Received – Mithila Queen (${registrationId})`,
    text: `Hello ${recipientName},\n\nWe have received your payment reference (${transactionRef}) for registration ${registrationId}.\nOur committee will independently verify it with bank records.\n\nBest regards,\nThe Origin Foundation`,
    html: `
      <div style="font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 580px; margin: 0 auto; background-color: #F3F1ED; border: 1px solid #DCD8D1; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #5C5751; padding: 24px; text-align: center; border-bottom: 2px solid #5C5751;">
          <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 800; margin: 0;">Mithila Queen</h1>
          <p style="color: #5C5751; font-size: 12px; font-weight: 600; margin: 4px 0 0 0; text-transform: uppercase;">Payment Under Verification</p>
        </div>
        <div style="padding: 30px 26px; background-color: #FFFFFF;">
          <p style="color: #5C5751; font-size: 15px; margin: 0 0 14px 0;">Hello <strong>${recipientName}</strong>,</p>
          <p style="color: #292824; font-size: 13.5px; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for submitting your transaction receipt for registration <strong>${registrationId}</strong>.
          </p>
          <div style="background-color: #F3F1ED; border: 1px solid #DCD8D1; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #D97706; margin: 0 0 4px 0;">Recorded Transaction Reference</p>
            <p style="font-size: 16px; font-family: monospace; font-weight: bold; color: #5C5751; margin: 0;">${transactionRef}</p>
            <p style="font-size: 12px; color: #71717a; margin: 8px 0 0 0;">Status: <strong>Payment Under Review</strong></p>
          </div>
          <p style="color: #71717a; font-size: 12px; line-height: 1.5; margin: 0;">
            Our finance committee will independently verify this transaction against our official banking statement within 24-48 hours. You will receive an email once verified.
          </p>
        </div>
        <div style="background-color: #5C5751; padding: 14px 24px; text-align: center;">
          <p style="color: #DCD8D1; font-size: 11px; margin: 0;">
            The Origin Foundation &bull; Janakpur Dham, Nepal
          </p>
        </div>
      </div>
    `,
  });
}

// ==========================================
// ADMIN PASSWORD RESET EMAIL
// ==========================================
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
    text: `Hello Administrator,\n\nA request was initiated to reset your Origin Foundation administrator password.\n\nYour 6-digit verification code is: ${otpCode}\n\nThis code will expire in ${expiresInMinutes} minutes.\n\nBest regards,\nOrigin Foundation Security Desk`,
    html: `
      <div style="font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #5C5751; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0;">The Origin Foundation</h1>
          <p style="color: #5C5751; font-size: 12px; font-weight: 700; margin: 6px 0 0 0; text-transform: uppercase;">Administrator Password Recovery</p>
        </div>
        
        <div style="padding: 32px 28px;">
          <p style="color: #18181b; font-size: 15px; margin: 0 0 16px 0;">Hello Administrator,</p>
          <p style="color: #52525b; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0;">
            A password reset was requested for your administrator account. Enter the 6-digit code below:
          </p>
          
          <div style="text-align: center; margin: 24px 0; background-color: #F3F1ED; border: 2px dashed #5C5751; border-radius: 12px; padding: 20px;">
            <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #5C5751; font-family: monospace;">
              ${otpCode}
            </div>
            <p style="color: #64748b; font-size: 12px; margin: 8px 0 0 0;">
              Valid for <strong>${expiresInMinutes} minutes</strong>
            </p>
          </div>
        </div>
        
        <div style="background-color: #5C5751; padding: 14px 24px; text-align: center;">
          <p style="color: #DCD8D1; font-size: 11px; margin: 0;">
            The Origin Foundation &bull; Janakpur Dham, Nepal
          </p>
        </div>
      </div>
    `,
  };

  return mailer.sendMail(mailOptions);
}

// ==========================================
// BULK / PARTICIPANT NOTICE EMAIL
// ==========================================
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
      <div style="font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #5C5751; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0;">${formName}</h1>
          <p style="color: #5C5751; font-size: 12px; font-weight: 700; margin: 6px 0 0 0; text-transform: uppercase;">Official Registration Notice</p>
        </div>
        
        <div style="padding: 32px 28px;">
          <p style="color: #18181b; font-size: 15px; margin: 0 0 16px 0;">Hello <strong>${recipientName}</strong>,</p>
          <div style="color: #3f3f46; font-size: 14px; line-height: 1.7; white-space: pre-wrap; margin: 0 0 24px 0;">
${messageText}
          </div>
        </div>
        
        <div style="background-color: #5C5751; padding: 14px 24px; text-align: center;">
          <p style="color: #DCD8D1; font-size: 11px; margin: 0;">
            The Origin Foundation &bull; Janakpur Dham, Nepal
          </p>
        </div>
      </div>
    `,
  };

  return mailer.sendMail(mailOptions);
}

// ==========================================
// REGISTRATION CONFIRMATION EMAIL (Legacy Compatibility)
// ==========================================
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

  return mailer.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `Registration Confirmed: ${eventTitle} (${referenceNumber})`,
    text: `Hello ${participantName},\n\nYour registration for "${eventTitle}" has been received.\nReference Number: ${referenceNumber}\nDate: ${submissionDate}\nStatus: ${status}\n\nView details: ${viewDetailsUrl}\n\nBest regards,\nThe Origin Foundation`,
    html: `
      <div style="font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 580px; margin: 0 auto; background-color: #F3F1ED; border: 1px solid #DCD8D1; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #5C5751; padding: 24px; text-align: center; border-bottom: 2px solid #5C5751;">
          <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0;">${eventTitle}</h1>
          <p style="color: #5C5751; font-size: 12px; font-weight: 700; margin: 4px 0 0 0; text-transform: uppercase;">Registration Confirmation</p>
        </div>
        <div style="padding: 30px 26px; background-color: #ffffff;">
          <p style="color: #5C5751; font-size: 15px; margin: 0 0 14px 0;">Hello <strong>${participantName}</strong>,</p>
          <p style="color: #292824; font-size: 13.5px; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for registering. Your entry reference number is <strong>${referenceNumber}</strong>.
          </p>
        </div>
        <div style="background-color: #5C5751; padding: 14px 24px; text-align: center;">
          <p style="color: #DCD8D1; font-size: 11px; margin: 0;">The Origin Foundation &bull; Janakpur Dham, Nepal</p>
        </div>
      </div>
    `,
  });
}

// ==========================================
// INQUIRY REPLY EMAIL (Direct response to contact form inquiry)
// ==========================================
export async function sendInquiryReplyEmail({
  to,
  recipientName,
  originalSubject,
  originalMessage,
  replySubject,
  replyMessage,
  adminName,
}: {
  to: string;
  recipientName: string;
  originalSubject?: string | null;
  originalMessage: string;
  replySubject: string;
  replyMessage: string;
  adminName?: string;
}) {
  const mailer = getEmailTransporter();
  const fromName = process.env.EMAIL_FROM_NAME || "The Origin Foundation";
  const fromEmail = process.env.EMAIL_FROM || "originfoundation107@gmail.com";

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: replySubject,
    text: `Hello ${recipientName},\n\nThank you for reaching out to The Origin Foundation regarding "${originalSubject || "Inquiry"}".\n\n${replyMessage}\n\n---\nYour Original Message:\n${originalMessage}\n\nBest regards,\n${adminName || "The Origin Foundation Organizing Committee"}\nJanakpur Dham, Nepal\nEmail: originfoundation107@gmail.com`,
    html: `
      <div style="font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #DCE5ED; border-radius: 14px; overflow: hidden;">
        <div style="background-color: #183153; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: -0.3px;">The Origin Foundation</h1>
          <p style="color: #94A3B8; font-size: 11px; font-weight: 600; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Official Inquiry Response &bull; Janakpur Dham, Nepal</p>
        </div>
        
        <div style="padding: 30px 28px;">
          <p style="color: #263238; font-size: 15px; margin: 0 0 16px 0;">Dear <strong>${recipientName}</strong>,</p>
          <div style="color: #263238; font-size: 14px; line-height: 1.7; white-space: pre-wrap; margin: 0 0 24px 0;">${replyMessage}</div>
          
          <div style="margin-top: 24px; padding: 16px; background-color: #F4F7FA; border-left: 3px solid #356FA8; border-radius: 6px;">
            <p style="font-size: 11px; font-weight: 700; color: #546E7A; margin: 0 0 6px 0; text-transform: uppercase;">Your Original Inquiry (${originalSubject || "General Guidance"}):</p>
            <p style="font-size: 12px; color: #546E7A; line-height: 1.6; margin: 0; font-style: italic;">
              &ldquo;${originalMessage}&rdquo;
            </p>
          </div>

          <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #DCE5ED; color: #546E7A; font-size: 12px; line-height: 1.6;">
            <strong>The Origin Foundation Organizing Committee</strong><br/>
            Janakpur Dham, Madhesh Province, Nepal<br/>
            Managing Directors: Gaurav Gupta (+977 9704571941) &bull; Dipendra Shah Kalwar (+977 981-2005468)<br/>
            Official Email: <a href="mailto:originfoundation107@gmail.com" style="color: #356FA8; text-decoration: none;">originfoundation107@gmail.com</a>
          </div>
        </div>
        
        <div style="background-color: #F4F7FA; padding: 14px 24px; text-align: center; border-top: 1px solid #DCE5ED;">
          <p style="color: #94A3B8; font-size: 11px; margin: 0;">
            Rooted in Identity. Driven by Purpose. &bull; Flagship Initiative: Mithila Queen
          </p>
        </div>
      </div>
    `,
  };

  return mailer.sendMail(mailOptions);
}

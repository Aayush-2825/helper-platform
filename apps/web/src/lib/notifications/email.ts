import { Resend } from "resend";

// Email sending utilities powered by Resend

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL;

let resendClient: Resend | null = null;

interface VerificationEmailData {
  user: { email: string; name: string };
  url: string;
}

interface PasswordResetEmailData {
  user: { email: string; name: string };
  url: string;
}

interface InvitationEmailData {
  email: string;
  organization: { name: string; id: string };
  inviter: { user: { name: string; email: string } };
  invitation: { id: string };
}

function getResendClient() {
  if (!RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY environment variable.");
  }

  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY);
  }

  return resendClient;
}

function getFromEmail() {
  if (!RESEND_FROM_EMAIL) {
    throw new Error("Missing RESEND_FROM_EMAIL environment variable.");
  }

  return RESEND_FROM_EMAIL;
}

async function sendEmail(params: EmailParams) {
  const resend = getResendClient();
  const from = getFromEmail();

  const { data, error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (error) {
    throw new Error(`Failed to send email to ${params.to}: ${error.message}`);
  }

  return data;
}

export async function sendVerificationEmail(data: VerificationEmailData) {
  const { user, url } = data;

  await sendEmail({
    to: user.email,
    subject: "Verify your email address - DOZO",
    html: `
      <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e5e7eb;">
          
          <div style="padding: 32px 40px; border-bottom: 1px solid #f3f4f6; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #111827; font-weight: 800; letter-spacing: -0.5px;">DOZO</h1>
          </div>

          <div style="padding: 40px; color: #374151;">
            <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; color: #111827; font-weight: 600;">Welcome, ${user.name}!</h2>
            <p style="margin: 0 0 24px 0; font-size: 16px;">We're excited to have you on board. To get started, please verify your email address by clicking the button below.</p>
            
            <div style="text-align: center;">
              <a href="${url}" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 8px 0 24px 0;">
                Verify Email Address
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            
            <p style="margin: 0; font-size: 14px; color: #6b7280; word-break: break-all;">
              Or copy and paste this link into your browser:<br/>
              <a href="${url}" style="color: #2563eb; text-decoration: underline;">${url}</a>
            </p>
          </div>

          <div style="padding: 24px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #f3f4f6;">
            <p style="margin: 0; color: #9ca3af; font-size: 13px;">
              This link expires in 24 hours. If you didn't sign up for DOZO, you can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData) {
  const { user, url } = data;

  await sendEmail({
    to: user.email,
    subject: "Reset your DOZO password",
    html: `
      <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e5e7eb;">
          
          <div style="padding: 32px 40px; border-bottom: 1px solid #f3f4f6; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #111827; font-weight: 800; letter-spacing: -0.5px;">DOZO</h1>
          </div>

          <div style="padding: 40px; color: #374151;">
            <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; color: #111827; font-weight: 600;">Password Reset Request</h2>
            <p style="margin: 0 0 24px 0; font-size: 16px;">Hi ${user.name}, we received a request to reset the password for your account. Click the button below to set a new password.</p>
            
            <div style="text-align: center;">
              <a href="${url}" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 8px 0 24px 0;">
                Reset Password
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            
            <p style="margin: 0; font-size: 14px; color: #6b7280; word-break: break-all;">
              Or copy and paste this link into your browser:<br/>
              <a href="${url}" style="color: #2563eb; text-decoration: underline;">${url}</a>
            </p>
          </div>

          <div style="padding: 24px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #f3f4f6;">
            <p style="margin: 0; color: #9ca3af; font-size: 13px;">
              This link expires in 30 minutes. If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendInvitationEmail(data: InvitationEmailData) {
  const { email, organization, inviter, invitation } = data;
  const invitationUrl = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/auth/accept-invite?id=${invitation.id}`;

  await sendEmail({
    to: email,
    subject: `${inviter.user.name} invited you to join ${organization.name} on DOZO`,
    html: `
      <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e5e7eb;">
          
          <div style="padding: 32px 40px; border-bottom: 1px solid #f3f4f6; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #111827; font-weight: 800; letter-spacing: -0.5px;">DOZO</h1>
          </div>

          <div style="padding: 40px; color: #374151;">
            <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 20px; color: #111827; font-weight: 600;">You've been invited!</h2>
            <p style="margin: 0 0 24px 0; font-size: 16px;">
              <strong>${inviter.user.name}</strong> (<a href="mailto:${inviter.user.email}" style="color: #6b7280; text-decoration: none;">${inviter.user.email}</a>) has invited you to collaborate in <strong>${organization.name}</strong>.
            </p>
            
            <div style="text-align: center;">
              <a href="${invitationUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 8px 0 24px 0;">
                Accept Invitation
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            
            <p style="margin: 0; font-size: 14px; color: #6b7280; word-break: break-all;">
              Or copy and paste this link into your browser:<br/>
              <a href="${invitationUrl}" style="color: #2563eb; text-decoration: underline;">${invitationUrl}</a>
            </p>
          </div>

          <div style="padding: 24px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #f3f4f6;">
            <p style="margin: 0; color: #9ca3af; font-size: 13px;">
              This invitation expires in 7 days. If you do not wish to join, you can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
  });
}
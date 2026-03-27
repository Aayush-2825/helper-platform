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
    subject: "Verify your email address",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Helper Platform, ${user.name}!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Or copy and paste this link: ${url}
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          This link expires in 24 hours.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData) {
  const { user, url } = data;

  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Or copy and paste this link: ${url}
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          This link expires in 30 minutes.<br/>
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendInvitationEmail(data: InvitationEmailData) {
  const { email, organization, inviter, invitation } = data;
  const invitationUrl = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/auth/accept-invite?id=${invitation.id}`;

  await sendEmail({
    to: email,
    subject: `${inviter.user.name} invited you to join ${organization.name}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're invited!</h2>
        <p><strong>${inviter.user.name}</strong> (${inviter.user.email}) invited you to join <strong>${organization.name}</strong></p>
        <p>Accept the invitation by clicking the button below:</p>
        <a href="${invitationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Accept Invitation
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Or copy and paste this link: ${invitationUrl}
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          This invitation expires in 7 days.
        </p>
      </div>
    `,
  });
}

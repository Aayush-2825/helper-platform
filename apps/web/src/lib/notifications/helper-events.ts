import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { db } from "@/db";
import { notificationEvent, user } from "@/db/schema";
import { sendGenericPushToUsers } from "@/lib/notifications/web-push";

export type HelperNotificationEvent =
  | "docs_submitted"
  | "doc_approved"
  | "doc_rejected"
  | "doc_resubmission_required"
  | "video_kyc_scheduled"
  | "video_kyc_passed"
  | "video_kyc_failed"
  | "doc_expiring_soon"
  | "doc_expired";

export interface NotificationPayload {
  helperUserId: string;
  event: HelperNotificationEvent;
  meta: {
    docTypes?: string[];
    rejectionReasons?: string[];
    meetLink?: string;
    scheduledAt?: string;
    expiresAt?: string;
    adminNotes?: string;
  };
}

type NotificationTemplate = {
  subject: string;
  message: string;
  templateKey: string;
};

function getTemplate(payload: NotificationPayload): NotificationTemplate {
  const docTypes = payload.meta.docTypes?.join(", ") ?? "document";
  const reasons = payload.meta.rejectionReasons?.join(", ") ?? "Please review your uploaded files.";

  switch (payload.event) {
    case "docs_submitted":
      return {
        subject: "We've received your documents, review in progress",
        message: "Your verification documents were submitted successfully. Our team is reviewing them now.",
        templateKey: "helper.docs_submitted",
      };
    case "doc_approved":
      return {
        subject: "One of your verification documents was approved",
        message: `Great news. ${docTypes} was approved.`,
        templateKey: "helper.doc_approved",
      };
    case "doc_rejected":
      return {
        subject: `One or more documents were rejected: ${reasons}`,
        message: `We could not approve ${docTypes}. Reason: ${reasons}`,
        templateKey: "helper.doc_rejected",
      };
    case "doc_resubmission_required":
      return {
        subject: `Please resubmit: ${docTypes}`,
        message: `Please upload updated copies for: ${docTypes}.`,
        templateKey: "helper.doc_resubmission_required",
      };
    case "video_kyc_scheduled":
      return {
        subject: `Your video verification is scheduled: ${payload.meta.scheduledAt ?? "Scheduled"} - ${payload.meta.meetLink ?? ""}`,
        message: `Your video KYC call has been scheduled for ${payload.meta.scheduledAt ?? "the selected time"}.`,
        templateKey: "helper.video_kyc_scheduled",
      };
    case "video_kyc_passed":
      return {
        subject: "You're verified! You can now receive bookings",
        message: "Your video verification is complete and your helper account is now active.",
        templateKey: "helper.video_kyc_passed",
      };
    case "video_kyc_failed":
      return {
        subject: `Video verification unsuccessful: ${payload.meta.adminNotes ?? "please contact support"}`,
        message: `Your video KYC attempt did not pass. ${payload.meta.adminNotes ?? "Please contact support for next steps."}`,
        templateKey: "helper.video_kyc_failed",
      };
    case "doc_expiring_soon":
      return {
        subject: `Your ${docTypes} expires in 7 days - please renew`,
        message: `Your ${docTypes} will expire soon. Please upload a renewed document before expiry.`,
        templateKey: "helper.doc_expiring_soon",
      };
    case "doc_expired":
      return {
        subject: `Your ${docTypes} has expired - your account is suspended`,
        message: `Your ${docTypes} has expired and your account has been suspended until re-verification.`,
        templateKey: "helper.doc_expired",
      };
  }
}

function getResendClient() {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY || process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL;
  if (!apiKey || !from) {
    return null;
  }

  return {
    resend: new Resend(apiKey),
    from,
  };
}

export async function enqueueHelperNotification(payload: NotificationPayload) {
  const template = getTemplate(payload);

  await db.insert(notificationEvent).values({
    id: crypto.randomUUID(),
    userId: payload.helperUserId,
    channel: "in_app",
    templateKey: template.templateKey,
    status: "queued",
    payload: {
      message: template.message,
      event: payload.event,
      ...payload.meta,
    },
  });

  const helperUser = await db.query.user.findFirst({
    where: eq(user.id, payload.helperUserId),
    columns: {
      email: true,
      name: true,
    },
  });

  if (helperUser?.email) {
    const emailClient = getResendClient();
    if (emailClient) {
      await emailClient.resend.emails.send({
        from: emailClient.from,
        to: helperUser.email,
        subject: template.subject,
        html: `<p>Hi ${helperUser.name ?? "there"},</p><p>${template.message}</p>`,
      });
    }
  }

  await sendGenericPushToUsers([payload.helperUserId], {
    title: "Helper verification update",
    body: template.message,
    url: "/helper/verification",
    data: {
      event: payload.event,
      ...payload.meta,
    },
  });
}

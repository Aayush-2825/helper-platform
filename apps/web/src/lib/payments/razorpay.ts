import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";

type RazorpaySecrets = {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
};

let razorpayInstance: Razorpay | null = null;

function readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

export function getRazorpaySecrets(): RazorpaySecrets {
  return {
    keyId: readRequiredEnv("RAZORPAY_KEY_ID"),
    keySecret: readRequiredEnv("RAZORPAY_KEY_SECRET"),
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || undefined,
  };
}

export function getRazorpayClient(): Razorpay {
  if (razorpayInstance) {
    return razorpayInstance;
  }

  const { keyId, keySecret } = getRazorpaySecrets();
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpayInstance;
}

function safeCompareHex(a: string, b: string): boolean {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export function verifyRazorpayPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getRazorpaySecrets();
  const body = `${input.orderId}|${input.paymentId}`;

  const expected = createHmac("sha256", keySecret).update(body).digest("hex");
  return safeCompareHex(expected, input.signature);
}

export function verifyRazorpayWebhookSignature(input: {
  payload: string;
  signature: string;
}): boolean {
  const webhookSecret = readRequiredEnv("RAZORPAY_WEBHOOK_SECRET");
  const expected = createHmac("sha256", webhookSecret)
    .update(input.payload)
    .digest("hex");

  return safeCompareHex(expected, input.signature);
}
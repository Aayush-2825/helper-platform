import { createHmac, timingSafeEqual } from "crypto";

type WsTokenPayload = {
  sub: string;
  exp: number;
  iat: number;
};

function decodeBase64UrlJson<T>(value: string): T | null {
  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

function hasValidShape(payload: WsTokenPayload | null): payload is WsTokenPayload {
  return Boolean(
    payload &&
      typeof payload.sub === "string" &&
      typeof payload.exp === "number" &&
      typeof payload.iat === "number",
  );
}

export function verifyWsAuthToken(
  token: string,
  expectedUserId: string,
  secret: string,
): boolean {
  if (!token || !expectedUserId || !secret) {
    return false;
  }

  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(payloadEncoded)
    .digest("base64url");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const actualBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  if (!timingSafeEqual(expectedBuffer, actualBuffer)) {
    return false;
  }

  const payload = decodeBase64UrlJson<WsTokenPayload>(payloadEncoded);
  if (!hasValidShape(payload)) {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp <= nowSeconds) {
    return false;
  }

  if (payload.sub !== expectedUserId) {
    return false;
  }

  return true;
}

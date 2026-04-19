import { createHmac } from "crypto";

type WsTokenPayload = {
  sub: string;
  exp: number;
  iat: number;
};

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

export function getWsAuthSecret(): string {
  const secret = process.env.REALTIME_WS_AUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error("Missing REALTIME_WS_AUTH_SECRET (or AUTH_SECRET) for websocket token signing.");
  }

  return secret.trim();
}

export function createWsAuthToken(userId: string, ttlSeconds = 300): { token: string; expiresAt: string } {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload: WsTokenPayload = {
    sub: userId,
    iat: nowSeconds,
    exp: nowSeconds + ttlSeconds,
  };

  const payloadEncoded = toBase64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", getWsAuthSecret())
    .update(payloadEncoded)
    .digest("base64url");

  return {
    token: `${payloadEncoded}.${signature}`,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  };
}

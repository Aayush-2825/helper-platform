import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

type BankDetailsInput = {
  accountHolderName: string;
  bankAccountNumber: string;
  ifscCode: string;
  upiId?: string | null;
};

type EncryptedBankDetails = {
  accountHolderName: string;
  bankAccountNumber: string;
  ifscCode: string;
  upiId: string | null;
};

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.AUTH_SECRET || "dev-only-local-key";
  return createHash("sha256").update(secret).digest();
}

function encryptValue(value: string): string {
  const iv = randomBytes(12);
  const key = getKey();
  const cipher = createCipheriv(ALGO, key, iv);

  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

function decryptValue(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted payload format");
  }

  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");

  const decipher = createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);

  const plain = Buffer.concat([decipher.update(data), decipher.final()]);
  return plain.toString("utf8");
}

export function encryptBankDetails(data: BankDetailsInput): EncryptedBankDetails {
  return {
    accountHolderName: encryptValue(data.accountHolderName),
    bankAccountNumber: encryptValue(data.bankAccountNumber),
    ifscCode: encryptValue(data.ifscCode),
    upiId: data.upiId ? encryptValue(data.upiId) : null,
  };
}

export function decryptBankDetails(data: EncryptedBankDetails): BankDetailsInput {
  return {
    accountHolderName: decryptValue(data.accountHolderName),
    bankAccountNumber: decryptValue(data.bankAccountNumber),
    ifscCode: decryptValue(data.ifscCode),
    upiId: data.upiId ? decryptValue(data.upiId) : null,
  };
}

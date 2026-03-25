type UnknownRecord = Record<string, unknown>;

function getMessageFromValue(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (value instanceof Error && value.message.trim()) {
    return value.message;
  }

  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as UnknownRecord;

  const directMessage = record.message;
  if (typeof directMessage === "string" && directMessage.trim()) {
    return directMessage;
  }

  const nestedError = record.error;
  if (nestedError && typeof nestedError === "object") {
    const nestedMessage = (nestedError as UnknownRecord).message;
    if (typeof nestedMessage === "string" && nestedMessage.trim()) {
      return nestedMessage;
    }
  }

  return undefined;
}

export function getErrorMessage(errorLike: unknown, fallback: string) {
  return getMessageFromValue(errorLike) ?? fallback;
}
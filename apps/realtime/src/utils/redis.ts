export function isValidRedisUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed === "/" ||
    trimmed === "none" ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    trimmed === "false"
  ) {
    return false;
  }
  return trimmed.startsWith("redis://") || trimmed.startsWith("rediss://");
}

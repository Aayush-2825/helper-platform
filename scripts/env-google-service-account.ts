import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function getArg(flag: string) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : null;
}

function usage() {
  // eslint-disable-next-line no-console
  console.log(
    [
      "Usage:",
      "  pnpm env:google-sa --path <service-account.json>",
      "",
      "Output:",
      "  Prints a single-line GOOGLE_SERVICE_ACCOUNT_JSON=... suitable for .env files.",
    ].join("\n"),
  );
}

const pathArg = getArg("--path") ?? process.argv[2];
if (!pathArg) {
  usage();
  process.exit(1);
}

const filePath = resolve(process.cwd(), pathArg);
const raw = readFileSync(filePath, "utf8");

let parsed: unknown;
try {
  parsed = JSON.parse(raw);
} catch (error) {
  // eslint-disable-next-line no-console
  console.error("Invalid JSON file:", error instanceof Error ? error.message : error);
  process.exit(1);
}

const singleLine = JSON.stringify(parsed);

// Prefer single quotes so \n stays escaped in most dotenv parsers.
// eslint-disable-next-line no-console
console.log(`GOOGLE_SERVICE_ACCOUNT_JSON='${singleLine}'`);


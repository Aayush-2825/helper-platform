import winston from "winston";

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

/**
 * Custom console format for development
 */
const devFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  if (stack) {
    msg += `\n${stack}`;
  }
  return msg;
});

/**
 * Structured Logger using Winston
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    json()
  ),
  defaultMeta: { service: "realtime" },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === "production" 
        ? combine(timestamp(), json()) 
        : combine(colorize(), timestamp(), devFormat),
    }),
  ],
});

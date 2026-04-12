/**
 * Structured logging utility for consistent log formatting
 */

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

interface LogContext {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: unknown;
  error?: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatLog(context: LogContext): string {
    const { timestamp, level, module, message, data, error } = context;

    let log = `[${timestamp}] [${level}] [${module}] ${message}`;

    if (data) {
      log += ` | data: ${JSON.stringify(data)}`;
    }

    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log += ` | error: ${errorMessage}`;
    }

    return log;
  }

  private log(level: LogLevel, module: string, message: string, data?: unknown, error?: unknown) {
    const context: LogContext = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
      error,
    };

    const formatted = this.formatLog(context);

    switch (level) {
      case "DEBUG":
        if (this.isDevelopment) console.debug(formatted);
        break;
      case "INFO":
        console.log(formatted);
        break;
      case "WARN":
        console.warn(formatted);
        break;
      case "ERROR":
        console.error(formatted);
        break;
    }
  }

  debug(module: string, message: string, data?: unknown) {
    this.log("DEBUG", module, message, data);
  }

  info(module: string, message: string, data?: unknown) {
    this.log("INFO", module, message, data);
  }

  warn(module: string, message: string, data?: unknown) {
    this.log("WARN", module, message, data);
  }

  error(module: string, message: string, data?: unknown, error?: unknown) {
    this.log("ERROR", module, message, data, error);
  }
}

export const logger = new Logger();

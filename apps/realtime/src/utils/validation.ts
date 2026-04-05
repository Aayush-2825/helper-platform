/**
 * Validation utilities for WebSocket message handlers
 */

export class ValidationError extends Error {
  constructor(message: string, public code: string = "VALIDATION_ERROR") {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validate required fields in an object
 */
export function validateRequired(
  data: Record<string, unknown>,
  fields: string[],
  context: string = ""
): void {
  const missing = fields.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw new ValidationError(
      `${context}: Missing required fields: ${missing.join(", ")}`,
      "MISSING_REQUIRED_FIELDS"
    );
  }
}

/**
 * Validate field types
 */
export function validateTypes(
  data: Record<string, unknown>,
  schema: Record<string, string>,
  context: string = ""
): void {
  for (const [field, expectedType] of Object.entries(schema)) {
    const value = data[field];
    const actualType = typeof value;

    if (value === undefined) {
      throw new ValidationError(
        `${context}: Missing field "${field}"`,
        "MISSING_FIELD"
      );
    }

    if (actualType !== expectedType) {
      throw new ValidationError(
        `${context}: Field "${field}" must be ${expectedType}, got ${actualType}`,
        "INVALID_TYPE"
      );
    }
  }
}

/**
 * Validate UUID format
 */
export function validateUUID(value: unknown, fieldName: string = "id"): void {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (typeof value !== "string" || !uuidRegex.test(value)) {
    throw new ValidationError(
      `${fieldName} must be a valid UUID`,
      "INVALID_UUID"
    );
  }
}

/**
 * Validate numeric constraints
 */
export function validateNumericRange(
  value: unknown,
  options: {
    min?: number;
    max?: number;
    fieldName: string;
  }
): void {
  const { min, max, fieldName } = options;

  if (typeof value !== "number") {
    throw new ValidationError(
      `${fieldName} must be a number`,
      "INVALID_TYPE"
    );
  }

  if (min !== undefined && value < min) {
    throw new ValidationError(
      `${fieldName} must be >= ${min}`,
      "OUT_OF_RANGE"
    );
  }

  if (max !== undefined && value > max) {
    throw new ValidationError(
      `${fieldName} must be <= ${max}`,
      "OUT_OF_RANGE"
    );
  }
}

/**
 * Validate enum values
 */
export function validateEnum(
  value: unknown,
  allowedValues: string[],
  fieldName: string = "value"
): void {
  if (!allowedValues.includes(value as string)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(", ")}`,
      "INVALID_ENUM"
    );
  }
}

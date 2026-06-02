import { describe, expect, it } from "vitest";
import { ValidationError, validateRequired } from "../validation.js";

describe("validateRequired", () => {
  it("allows valid falsy values such as 0 and false", () => {
    expect(() =>
      validateRequired(
        {
          latitude: 0,
          longitude: 0,
          enabled: false,
        },
        ["latitude", "longitude", "enabled"],
        "realtime_message"
      )
    ).not.toThrow();
  });

  it("throws when a field is undefined or null", () => {
    expect(() =>
      validateRequired(
        {
          latitude: undefined,
          longitude: null,
        },
        ["latitude", "longitude"],
        "realtime_message"
      )
    ).toThrow(ValidationError);
  });
});
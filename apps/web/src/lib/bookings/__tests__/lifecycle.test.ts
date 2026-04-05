import { describe, expect, it } from "vitest";
import {
  isCustomerCancellableBookingStatus,
  isMatchableBookingStatus,
  isTerminalBookingStatus,
} from "../lifecycle";

describe("booking lifecycle policy", () => {
  it("marks requested and matched as matchable", () => {
    expect(isMatchableBookingStatus("requested")).toBe(true);
    expect(isMatchableBookingStatus("matched")).toBe(true);
    expect(isMatchableBookingStatus("accepted")).toBe(false);
    expect(isMatchableBookingStatus("expired")).toBe(false);
  });

  it("allows customer cancellation only before in_progress", () => {
    expect(isCustomerCancellableBookingStatus("requested")).toBe(true);
    expect(isCustomerCancellableBookingStatus("matched")).toBe(true);
    expect(isCustomerCancellableBookingStatus("accepted")).toBe(true);
    expect(isCustomerCancellableBookingStatus("in_progress")).toBe(false);
    expect(isCustomerCancellableBookingStatus("completed")).toBe(false);
  });

  it("classifies terminal lifecycle states", () => {
    expect(isTerminalBookingStatus("completed")).toBe(true);
    expect(isTerminalBookingStatus("cancelled")).toBe(true);
    expect(isTerminalBookingStatus("expired")).toBe(true);
    expect(isTerminalBookingStatus("disputed")).toBe(true);
    expect(isTerminalBookingStatus("accepted")).toBe(false);
  });
});

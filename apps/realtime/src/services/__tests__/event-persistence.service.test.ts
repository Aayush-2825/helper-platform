import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const notificationInsertMock = vi.fn();
  const bookingInsertMock = vi.fn();
  const updateSetMock = vi.fn();
  const updateWhereMock = vi.fn();
  const dbSelectLimitMock = vi.fn();
  const webSelectLimitMock = vi.fn();

  const notificationQueue = {
    __table: "notification_queue",
    id: "notification_id",
    payload: "notification_payload",
    sent: "notification_sent",
    userId: "notification_user_id",
  };

  const bookingEvents = {
    __table: "booking_events",
  };

  const booking = {
    __table: "booking",
    id: "booking_id",
    customerId: "booking_customer_id",
    helperId: "booking_helper_id",
  };

  const db = {
    insert: vi.fn((table: unknown) => ({
      values: (values: unknown) => {
        if (table === notificationQueue) {
          return notificationInsertMock(values);
        }

        if (table === bookingEvents) {
          return bookingInsertMock(values);
        }

        return Promise.resolve();
      },
    })),
    update: vi.fn(() => ({
      set: (values: unknown) => {
        updateSetMock(values);
        return {
          where: updateWhereMock,
        };
      },
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: dbSelectLimitMock,
        })),
      })),
    })),
  };

  const webDb = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: webSelectLimitMock,
        })),
      })),
    })),
  };

  return {
    db,
    webDb,
    notificationQueue,
    bookingEvents,
    booking,
    notificationInsertMock,
    bookingInsertMock,
    updateSetMock,
    updateWhereMock,
    dbSelectLimitMock,
    webSelectLimitMock,
  };
});

vi.mock("../../db/index.js", () => ({
  db: mocks.db,
  webDb: mocks.webDb,
}));

vi.mock("../../db/schema.js", () => ({
  notificationQueue: mocks.notificationQueue,
  bookingEvents: mocks.bookingEvents,
  booking: mocks.booking,
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: unknown[]) => ({ op: "eq", args })),
  and: vi.fn((...args: unknown[]) => ({ op: "and", args })),
  inArray: vi.fn((...args: unknown[]) => ({ op: "inArray", args })),
}));

import {
  flushQueuedNotificationsForUser,
  persistOutboundEvent,
} from "../event-persistence.service.js";

describe("event persistence service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notificationInsertMock.mockResolvedValue(undefined);
    mocks.bookingInsertMock.mockResolvedValue(undefined);
    mocks.updateWhereMock.mockResolvedValue(undefined);
    mocks.dbSelectLimitMock.mockResolvedValue([]);
    mocks.webSelectLimitMock.mockResolvedValue([]);
  });

  it("persists deduplicated notification rows and booking audit event", async () => {
    await persistOutboundEvent({
      event: "booking_update",
      data: {
        bookingId: "bk_1",
        eventType: "expired",
        customerId: "cus_1",
        helperId: "hlp_1",
      },
      targetUserIds: ["cus_1", "cus_1", "hlp_1", ""],
    });

    expect(mocks.notificationInsertMock).toHaveBeenCalledOnce();
    const insertedNotifications = mocks.notificationInsertMock.mock.calls[0]![0] as Array<{ userId: string; eventType: string }>;
    expect(insertedNotifications).toHaveLength(2);
    expect(insertedNotifications.map((row) => row.userId).sort()).toEqual(["cus_1", "hlp_1"]);
    expect(insertedNotifications.every((row) => row.eventType === "booking_update")).toBe(true);

    expect(mocks.bookingInsertMock).toHaveBeenCalledOnce();
    const bookingAuditRow = mocks.bookingInsertMock.mock.calls[0]![0] as { eventType: string; bookingId: string };
    expect(bookingAuditRow.bookingId).toBe("bk_1");
    expect(bookingAuditRow.eventType).toBe("matching_timeout");
  });

  it("resolves booking participants from web DB when customerId is absent", async () => {
    mocks.webSelectLimitMock.mockResolvedValue([
      { customerId: "cus_lookup", helperId: "hlp_lookup" },
    ]);

    await persistOutboundEvent({
      event: "booking_request",
      data: {
        bookingId: "bk_lookup",
      },
      targetUserIds: ["hlp_lookup"],
    });

    expect(mocks.webSelectLimitMock).toHaveBeenCalledOnce();
    expect(mocks.bookingInsertMock).toHaveBeenCalledOnce();
    const bookingAuditRow = mocks.bookingInsertMock.mock.calls[0]![0] as {
      customerId: string;
      helperId: string;
      eventType: string;
    };
    expect(bookingAuditRow.customerId).toBe("cus_lookup");
    expect(bookingAuditRow.helperId).toBe("hlp_lookup");
    expect(bookingAuditRow.eventType).toBe("created");
  });

  it("flushes queued notifications and marks delivered rows as sent", async () => {
    mocks.dbSelectLimitMock.mockResolvedValue([
      { id: "n1", payload: JSON.stringify({ event: "notification", data: { message: "A" } }) },
      { id: "n2", payload: "{not-json}" },
      { id: "n3", payload: JSON.stringify({ data: { message: "missing event" } }) },
    ]);

    const sendEvent = vi.fn();
    await flushQueuedNotificationsForUser("cus_1", sendEvent);

    expect(sendEvent).toHaveBeenCalledOnce();
    expect(sendEvent).toHaveBeenCalledWith({
      type: "event",
      event: "notification",
      data: { message: "A" },
    });

    expect(mocks.updateSetMock).toHaveBeenCalledOnce();
    expect(mocks.updateSetMock).toHaveBeenCalledWith(expect.objectContaining({ sent: true }));
    expect(mocks.updateWhereMock).toHaveBeenCalledOnce();
  });

  it("does not update queue when there are no deliverable payloads", async () => {
    mocks.dbSelectLimitMock.mockResolvedValue([
      { id: "n1", payload: "bad-json" },
      { id: "n2", payload: JSON.stringify({ data: { only: "data" } }) },
    ]);

    const sendEvent = vi.fn();
    await flushQueuedNotificationsForUser("cus_1", sendEvent);

    expect(sendEvent).not.toHaveBeenCalled();
    expect(mocks.updateSetMock).not.toHaveBeenCalled();
    expect(mocks.updateWhereMock).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { broadcastEvent } from "../../ws/dispatch";
import { startBackgroundJobs } from "../jobs";

vi.mock("../../ws/dispatch", () => ({
  broadcastEvent: vi.fn(),
}));

import { webDb } from "../../db/index";
import { booking } from "../../db/schema";

describe("jobs.expiration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls dispatcher.sendToUser for expired bookings", async () => {
    const fake = [{ id: "b1", customerId: "c1" }];
    vi.spyOn(webDb, "update").mockReturnValueOnce({
      set: () => ({
        where: () => ({
          returning: async () => fake,
        }),
      }),
    } as any);

    const original = global.setInterval;
    const calls: Function[] = [];
    // @ts-ignore
    global.setInterval = (cb: Function, _ms: number) => { calls.push(cb); return 1 as any; };

    startBackgroundJobs();

    await calls[0]();

    expect(broadcastEvent).toHaveBeenCalledWith(expect.objectContaining({ event: "booking_update", targetUserIds: ["c1"] }));

    global.setInterval = original;
  });
});

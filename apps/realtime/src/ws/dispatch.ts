import { dispatcher } from "./dispatcher.js";
import { persistOutboundEvent } from "../services/event-persistence.service.js";
import { logger } from "../services/logger.js";

/**
 * Higher-level event dispatcher that persists events and sends them via WS
 */
export async function broadcastEvent({
  event,
  data,
  targetUserIds,
}: {
  event: string;
  data: Record<string, unknown>;
  targetUserIds?: string[];
}) {
  const message = {
    type: "event",
    event,
    data,
  };

  // 1. Persist for offline delivery/history
  try {
    await persistOutboundEvent({ event, data, targetUserIds });
  } catch (err) {
    logger.error("[Dispatch] Failed to persist event", { event, err });
  }

  // 2. Deliver via WebSockets
  if (targetUserIds && targetUserIds.length > 0) {
    dispatcher.multicast(targetUserIds, message as any);
  } else {
    dispatcher.broadcast(message as any);
  }
}

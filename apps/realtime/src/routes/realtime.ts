import { Router } from "express";
import { broadcastEvent } from "../index.js";
import { env } from "../config/env.js";

const realtimeRouter: Router = Router();

realtimeRouter.post("/broadcast", (req, res) => {
  const configuredSecret = env.REALTIME_BROADCAST_SECRET?.trim();
  if (!configuredSecret) {
    return res.status(500).json({ error: "Broadcast secret not configured on server" });
  }

  const providedSecret = req.headers["x-realtime-secret"];
  if (providedSecret !== configuredSecret) {
    return res.status(401).json({ error: "Unauthorized broadcast request" });
  }

  const { event, data, targetUserIds } = req.body;

  if (!event || typeof event !== "string") {
    return res.status(400).json({ error: "Missing or invalid event" });
  }

  if (targetUserIds !== undefined && !Array.isArray(targetUserIds)) {
    return res.status(400).json({ error: "targetUserIds must be an array" });
  }

  broadcastEvent({ event, data: data ?? {}, targetUserIds });

  return res.json({ success: true });
});

export default realtimeRouter;

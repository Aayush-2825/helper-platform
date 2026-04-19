import { Router } from "express";
import { broadcastEvent } from "../index.js";
import { env } from "../config/env.js";

const realtimeRouter: Router = Router();

realtimeRouter.post("/broadcast", (req, res) => {
  if (env.REALTIME_BROADCAST_SECRET) {
    const providedSecret = req.headers["x-realtime-secret"];
    if (providedSecret !== env.REALTIME_BROADCAST_SECRET) {
      return res.status(401).json({ error: "Unauthorized broadcast request" });
    }
  }

  const { event, data, targetUserIds } = req.body;

  if (!event) {
    return res.status(400).json({ error: "Missing event" });
  }

  broadcastEvent({ event, data, targetUserIds });

  return res.json({ success: true });
});

export default realtimeRouter;

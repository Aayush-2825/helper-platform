import { Router } from "express";
import { broadcastEvent } from "../index.js";

const realtimeRouter: Router = Router();

realtimeRouter.post("/broadcast", (req, res) => {
  const { event, data, targetUserIds } = req.body;

  if (!event) {
    return res.status(400).json({ error: "Missing event" });
  }

  broadcastEvent({ event, data, targetUserIds });

  return res.json({ success: true });
});

export default realtimeRouter;

// Redis subscriber

import { sub } from "../redis/index.js";

export function initSubscriber() {
  sub.subscribe("events");

  sub.on("message", (channel, message) => {
    if (channel === "events") {
      const event = JSON.parse(message);
      // Handle the event as needed
    }
  });
}

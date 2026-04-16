// Singleton send reference — set by useWebSocket on mount
let _send: ((msg: object) => boolean) | null = null;
const _queue: object[] = [];

export function registerWsSend(fn: (msg: object) => boolean) {
  console.log("[WSManager] registerWsSend called");
  _send = fn;
  const pending = _queue.splice(0, _queue.length);
  if (pending.length > 0) {
    console.log(`[WSManager] flushing queued messages: ${pending.length}`);
  }
  for (const msg of pending) {
    const delivered = _send(msg);
    if (!delivered) {
      console.warn("[WSManager] flush send failed, re-queueing message", msg);
      _queue.push(msg);
    }
  }
}

export function wsSend(msg: object) {
  if (!_send) {
    console.warn("[WSManager] no active sender, queueing message", msg);
    _queue.push(msg);
    return;
  }
  const delivered = _send(msg);
  if (!delivered) {
    console.warn("[WSManager] send failed, queueing message", msg);
    _queue.push(msg);
    return;
  }

  console.log("[WSManager] message sent", msg);
}

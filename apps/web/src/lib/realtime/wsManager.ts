// Singleton send reference — set by useWebSocket on mount
let _send: ((msg: object) => boolean) | null = null;
const _queue: object[] = [];

export function registerWsSend(fn: (msg: object) => boolean) {
  _send = fn;
  // Flush queued messages. Use a loop so that any messages queued while
  // flushing are also processed before we return.
  while (true) {
    const pending = _queue.splice(0, _queue.length);
    if (pending.length === 0) break;
    for (const msg of pending) {
      const delivered = _send(msg);
      if (!delivered) {
        console.warn("[WSManager] flush send failed, re-queueing message", msg);
        _queue.push(msg);
      }
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
}

export function resetWsManager() {
  _send = null;
  _queue.length = 0;
}

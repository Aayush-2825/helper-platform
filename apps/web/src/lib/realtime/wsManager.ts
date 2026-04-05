// Singleton send reference — set by useWebSocket on mount
let _send: ((msg: object) => boolean) | null = null;
const _queue: object[] = [];

export function registerWsSend(fn: (msg: object) => boolean) {
  _send = fn;
  const pending = _queue.splice(0, _queue.length);
  for (const msg of pending) {
    const delivered = _send(msg);
    if (!delivered) {
      _queue.push(msg);
    }
  }
}

export function wsSend(msg: object) {
  if (!_send) {
    _queue.push(msg);
    return;
  }
  const delivered = _send(msg);
  if (!delivered) {
    _queue.push(msg);
  }
}

// Singleton send reference — set by useWebSocket on mount
let _send: ((msg: object) => void) | null = null;
const _queue: object[] = [];

export function registerWsSend(fn: (msg: object) => void) {
  _send = fn;
  while (_queue.length > 0) {
    _send(_queue.shift()!);
  }
}

export function wsSend(msg: object) {
  if (!_send) {
    _queue.push(msg);
    return;
  }
  _send(msg);
}

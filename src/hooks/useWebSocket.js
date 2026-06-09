import { useEffect, useRef } from "react";
export function useWebSocket(url, { onMessage } = {}) {
  const wsRef = useRef(null);
  useEffect(() => {
    if (!url) return;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    if (onMessage) ws.onmessage = (e) => onMessage(e);
    return () => ws.close();
  }, [url]);
  return wsRef;
}

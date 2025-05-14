import { Activity } from "@/types/activity";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";

let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 3000;

type MessageCallback = (activity: Activity) => void;
const subscribers = new Set<MessageCallback>();

// Store external onOpen and onClose callbacks
let onOpenCallback: (() => void) | null = null;
let onCloseCallback: (() => void) | null = null;

function connect(
  authToken: string | null,
  onOpen?: () => void,
  onClose?: () => void
): void {
  if (!authToken) {
    console.error("WebSocket: Auth token is missing. Cannot connect.");
    if (onClose) onClose();
    return;
  }
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    console.log("WebSocket is already connected or connecting.");
    if (onOpen) onOpen();
    return;
  }

  console.log("WebSocket: Attempting to connect...");
  if (onOpen) onOpenCallback = onOpen;
  if (onClose) onCloseCallback = onClose;

  socket = new WebSocket(`${WS_URL}?token=${authToken}`);

  socket.onopen = () => {
    console.log("WebSocket: Connection established.");
    reconnectAttempts = 0; // Reset on successful connection
    if (onOpenCallback) onOpenCallback();
  };

  socket.onmessage = (event) => {
    try {
      const activity = JSON.parse(event.data as string) as Activity;
      console.log("WebSocket: Message received:", activity);
      subscribers.forEach((callback) => callback(activity));
    } catch (error) {
      console.error("WebSocket: Error parsing message data:", error);
    }
  };

  socket.onclose = (event) => {
    console.log(
      `WebSocket: Connection closed. Code: ${event.code}, Reason: ${event.reason}`
    );
    const wasConnected = socket != null; // Check if it was connected before
    socket = null;

    if (onCloseCallback) onCloseCallback(); // Call the external onClose callback

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && wasConnected) {
      reconnectAttempts++;
      console.log(
        `WebSocket: Attempting to reconnect in ${
          RECONNECT_DELAY_MS / 1000
        }s... (Attempt ${reconnectAttempts})`
      );
      setTimeout(() => connect(authToken, onOpen, onClose), RECONNECT_DELAY_MS);
    } else {
      console.error("WebSocket: Max reconnect attempts reached.");
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket: Error:", error);
    // onclose will usually be called after an error, triggering reconnection logic
  };
}

function disconnect(): void {
  if (socket) {
    console.log("WebSocket: Disconnecting...");
    reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // Prevent reconnection
    socket.close();
    socket = null;
  } else if (onCloseCallback) {
    console.log("WebSocket: No active connection to disconnect.");
    onCloseCallback();
  }
}

function subscribe(callback: MessageCallback): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function isConnected(): boolean {
  return socket !== null && socket.readyState === WebSocket.OPEN;
}

export const webSocketService = {
  connect,
  disconnect,
  subscribe,
  isConnected,
};

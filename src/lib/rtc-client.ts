// Simple mesh WebRTC client that polls DB signaling
// Supports host broadcasting media to viewers (viewers keep recvonly).

export type SignalHandler = (msg: {
  id: number;
  fromUserId: number;
  kind: string;
  payload: unknown;
  createdAt: string;
}) => void;

export class SignalingClient {
  private since: string | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  constructor(private roomId: string, private onMessage: SignalHandler) {}

  start() {
    this.timer = setInterval(() => this.poll(), 1500);
    void this.poll();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  async poll() {
    const url = this.since
      ? `/api/rtc/${this.roomId}?since=${encodeURIComponent(this.since)}`
      : `/api/rtc/${this.roomId}`;
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) return;
      const arr = await r.json();
      for (const msg of arr) {
        this.since = msg.createdAt;
        this.onMessage(msg);
      }
    } catch {}
  }

  async send(kind: string, payload: unknown, toUserId?: number) {
    await fetch(`/api/rtc/${this.roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, payload, toUserId }),
    });
  }
}

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

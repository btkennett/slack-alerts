/**
 * Simple token bucket rate limiter.
 * Allows 1 message per `intervalMs` (default 1000ms).
 * If the bucket is empty, the message is queued and sent after the interval.
 */
export class RateLimiter {
  private lastSendTime = 0;
  private queue: Array<() => void> = [];
  private processing = false;
  private intervalMs: number;

  constructor(intervalMs: number = 1000) {
    this.intervalMs = intervalMs;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastSendTime;

    if (elapsed >= this.intervalMs) {
      this.lastSendTime = now;
      return;
    }

    // Wait for the remaining time
    const waitMs = this.intervalMs - elapsed;
    await new Promise<void>((resolve) => setTimeout(resolve, waitMs));
    this.lastSendTime = Date.now();
  }
}

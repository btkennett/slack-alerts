"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
/**
 * Simple token bucket rate limiter.
 * Allows 1 message per `intervalMs` (default 1000ms).
 * If the bucket is empty, the message is queued and sent after the interval.
 */
class RateLimiter {
    constructor(intervalMs = 1000) {
        this.lastSendTime = 0;
        this.queue = [];
        this.processing = false;
        this.intervalMs = intervalMs;
    }
    async acquire() {
        const now = Date.now();
        const elapsed = now - this.lastSendTime;
        if (elapsed >= this.intervalMs) {
            this.lastSendTime = now;
            return;
        }
        // Wait for the remaining time
        const waitMs = this.intervalMs - elapsed;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        this.lastSendTime = Date.now();
    }
}
exports.RateLimiter = RateLimiter;

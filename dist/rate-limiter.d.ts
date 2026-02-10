/**
 * Simple token bucket rate limiter.
 * Allows 1 message per `intervalMs` (default 1000ms).
 * If the bucket is empty, the message is queued and sent after the interval.
 */
export declare class RateLimiter {
    private lastSendTime;
    private queue;
    private processing;
    private intervalMs;
    constructor(intervalMs?: number);
    acquire(): Promise<void>;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackAlertsClient = void 0;
const formatter_1 = require("./formatter");
const rate_limiter_1 = require("./rate-limiter");
class SlackAlertsClient {
    constructor(config) {
        this.config = config;
        this.rateLimiter = new rate_limiter_1.RateLimiter(config.rateLimitMs ?? 1000);
        this._enabled =
            config.enabled !== undefined
                ? config.enabled
                : !!config.webhookUrl;
        if (!this._enabled) {
            console.warn(`[SlackAlerts] ${config.appName}: Disabled (no webhook URL or explicitly disabled)`);
        }
    }
    isEnabled() {
        return this._enabled;
    }
    /**
     * Send a Slack alert. Fire-and-forget: never throws.
     */
    async send(event) {
        if (!this._enabled) {
            return;
        }
        try {
            await this.rateLimiter.acquire();
            const payload = (0, formatter_1.formatSlackMessage)(event, this.config);
            const response = await fetch(this.config.webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const text = await response.text();
                console.error(`[SlackAlerts] ${this.config.appName}: HTTP ${response.status} - ${text}`);
            }
        }
        catch (error) {
            console.error(`[SlackAlerts] ${this.config.appName}: Failed to send alert -`, error instanceof Error ? error.message : error);
        }
    }
}
exports.SlackAlertsClient = SlackAlertsClient;

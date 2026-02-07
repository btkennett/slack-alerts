import { SlackAlertConfig, SlackEvent } from "./types";
import { formatSlackMessage } from "./formatter";
import { RateLimiter } from "./rate-limiter";

export class SlackAlertsClient {
  private config: SlackAlertConfig;
  private rateLimiter: RateLimiter;
  private _enabled: boolean;

  constructor(config: SlackAlertConfig) {
    this.config = config;
    this.rateLimiter = new RateLimiter(config.rateLimitMs ?? 1000);
    this._enabled =
      config.enabled !== undefined
        ? config.enabled
        : !!config.webhookUrl;

    if (!this._enabled) {
      console.warn(
        `[SlackAlerts] ${config.appName}: Disabled (no webhook URL or explicitly disabled)`
      );
    }
  }

  isEnabled(): boolean {
    return this._enabled;
  }

  /**
   * Send a Slack alert. Fire-and-forget: never throws.
   */
  async send(event: SlackEvent): Promise<void> {
    if (!this._enabled) {
      return;
    }

    try {
      await this.rateLimiter.acquire();

      const payload = formatSlackMessage(event, this.config);

      const response = await fetch(this.config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(
          `[SlackAlerts] ${this.config.appName}: HTTP ${response.status} - ${text}`
        );
      }
    } catch (error) {
      console.error(
        `[SlackAlerts] ${this.config.appName}: Failed to send alert -`,
        error instanceof Error ? error.message : error
      );
    }
  }
}

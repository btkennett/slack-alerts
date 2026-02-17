import { SlackAlertConfig, SlackEvent, SlackSendOptions } from "./types";
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
        : !!(config.webhookUrl || config.botToken);

    if (!this._enabled) {
      console.warn(
        `[SlackAlerts] ${config.appName}: Disabled (no webhook URL/bot token or explicitly disabled)`
      );
    }
  }

  isEnabled(): boolean {
    return this._enabled;
  }

  /**
   * Send a Slack alert. Fire-and-forget: never throws.
   *
   * When `options.channel` is specified and `botToken` is configured,
   * posts via chat.postMessage (dynamic channel routing).
   * Otherwise falls back to the webhook URL (fixed channel).
   */
  async send(event: SlackEvent, options?: SlackSendOptions): Promise<void> {
    if (!this._enabled) {
      return;
    }

    try {
      await this.rateLimiter.acquire();

      const payload = formatSlackMessage(event, this.config);

      // Dynamic channel routing via Bot Token
      if (options?.channel && this.config.botToken) {
        await this.sendViaBotToken(payload, options.channel, event);
        return;
      }

      // Fallback: webhook (fixed channel)
      if (!this.config.webhookUrl) {
        console.warn(
          `[SlackAlerts] ${this.config.appName}: No webhook URL and no channel/botToken — skipping`
        );
        return;
      }

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

  /**
   * Post a message to a specific channel via Slack's chat.postMessage API.
   * Uses the Bot Token from config. No external dependencies — just fetch.
   */
  private async sendViaBotToken(
    payload: Record<string, unknown>,
    channel: string,
    event: SlackEvent
  ): Promise<void> {
    // Extract blocks from the webhook-formatted payload
    const attachments = payload.attachments as Array<{ blocks?: unknown[]; color?: string }> | undefined;
    const blocks = attachments?.[0]?.blocks;

    const body: Record<string, unknown> = {
      channel,
      text: `${event.title}: ${event.message}`, // Fallback for notifications
    };

    if (blocks) {
      body.blocks = blocks;
    }

    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as { ok: boolean; error?: string };
    if (!data.ok) {
      console.error(
        `[SlackAlerts] ${this.config.appName}: chat.postMessage error — ${data.error}`
      );
    }
  }
}

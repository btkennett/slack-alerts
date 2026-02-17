import { SlackAlertConfig, SlackEvent, SlackSendOptions } from "./types";
export declare class SlackAlertsClient {
    private config;
    private rateLimiter;
    private _enabled;
    constructor(config: SlackAlertConfig);
    isEnabled(): boolean;
    /**
     * Send a Slack alert. Fire-and-forget: never throws.
     *
     * When `options.channel` is specified and `botToken` is configured,
     * posts via chat.postMessage (dynamic channel routing).
     * Otherwise falls back to the webhook URL (fixed channel).
     */
    send(event: SlackEvent, options?: SlackSendOptions): Promise<void>;
    /**
     * Post a message to a specific channel via Slack's chat.postMessage API.
     * Uses the Bot Token from config. No external dependencies — just fetch.
     */
    private sendViaBotToken;
}

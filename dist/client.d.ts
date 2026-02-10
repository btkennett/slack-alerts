import { SlackAlertConfig, SlackEvent } from "./types";
export declare class SlackAlertsClient {
    private config;
    private rateLimiter;
    private _enabled;
    constructor(config: SlackAlertConfig);
    isEnabled(): boolean;
    /**
     * Send a Slack alert. Fire-and-forget: never throws.
     */
    send(event: SlackEvent): Promise<void>;
}

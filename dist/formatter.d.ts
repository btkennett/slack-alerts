import { SlackEvent, SlackAlertConfig } from "./types";
/**
 * Build a Slack Block Kit message payload for an event.
 * Uses attachments for the colored sidebar + blocks for rich layout.
 */
export declare function formatSlackMessage(event: SlackEvent, config: SlackAlertConfig): Record<string, unknown>;

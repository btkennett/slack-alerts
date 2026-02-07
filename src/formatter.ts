import { SlackEvent, SlackAlertConfig, SEVERITY_MAP } from "./types";

/**
 * Build a Slack Block Kit message payload for an event.
 * Uses attachments for the colored sidebar + blocks for rich layout.
 */
export function formatSlackMessage(
  event: SlackEvent,
  config: SlackAlertConfig
): Record<string, unknown> {
  const severity = SEVERITY_MAP[event.severity];
  const blocks: Record<string, unknown>[] = [];

  // Header
  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: `${severity.emoji} ${event.title}`,
      emoji: true,
    },
  });

  // Body
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: event.message,
    },
  });

  // Metadata fields (if any)
  if (event.metadata && Object.keys(event.metadata).length > 0) {
    const fields = Object.entries(event.metadata).map(([key, value]) => ({
      type: "mrkdwn" as const,
      text: `*${key}:* ${value}`,
    }));

    // Slack allows max 10 fields per section
    blocks.push({
      type: "section",
      fields: fields.slice(0, 10),
    });
  }

  // Action button (if URL provided)
  if (event.url) {
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "View Details",
            emoji: true,
          },
          url: event.url,
          style: event.severity === "critical" ? "danger" : "primary",
        },
      ],
    });
  }

  // Context footer
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `${config.appName} | ${config.environment} | ${new Date().toISOString()}`,
      },
    ],
  });

  return {
    attachments: [
      {
        color: severity.color,
        blocks,
      },
    ],
  };
}

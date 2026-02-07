export interface SlackAlertConfig {
  webhookUrl: string;
  appName: string; // "FN Compass" | "STDocs" | "FN Forge"
  environment: string; // "production" | "development" | "staging"
  enabled?: boolean; // default: true if webhookUrl set
  rateLimitMs?: number; // default: 1000
}

export interface SlackEvent {
  severity: "info" | "warning" | "critical" | "success";
  title: string;
  message: string;
  metadata?: Record<string, string | number>;
  url?: string; // Link button in message
}

export interface SeverityConfig {
  color: string;
  emoji: string;
}

export const SEVERITY_MAP: Record<SlackEvent["severity"], SeverityConfig> = {
  critical: { color: "#EF4444", emoji: "\u{1F6A8}" }, // rotating light
  warning: { color: "#F59E0B", emoji: "\u26A0\uFE0F" }, // warning sign
  success: { color: "#10B981", emoji: "\u2705" }, // check mark
  info: { color: "#3B82F6", emoji: "\u2139\uFE0F" }, // info
};

export interface SlackAlertConfig {
    webhookUrl: string;
    appName: string;
    environment: string;
    enabled?: boolean;
    rateLimitMs?: number;
}
export interface SlackEvent {
    severity: "info" | "warning" | "critical" | "success";
    title: string;
    message: string;
    metadata?: Record<string, string | number>;
    url?: string;
}
export interface SeverityConfig {
    color: string;
    emoji: string;
}
export declare const SEVERITY_MAP: Record<SlackEvent["severity"], SeverityConfig>;

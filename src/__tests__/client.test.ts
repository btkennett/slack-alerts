import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SlackAlertsClient } from "../client.js";
import type { SlackAlertConfig, SlackEvent } from "../types.js";

const baseConfig: SlackAlertConfig = {
  webhookUrl: "https://hooks.slack.com/services/T00/B00/xxx",
  appName: "TestApp",
  environment: "test",
};

const baseEvent: SlackEvent = {
  severity: "critical",
  title: "Database connection lost",
  message: "Primary Neon pool exhausted after 30s timeout",
  metadata: { host: "divine-pine", pool: "12/12" },
};

describe("SlackAlertsClient", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Test 1: Successful send via webhook ───────────────────────────
  it("sends a well-formed Block Kit payload via webhook", async () => {
    fetchSpy.mockResolvedValueOnce(new Response("ok", { status: 200 }));

    const client = new SlackAlertsClient(baseConfig);
    await client.send(baseEvent);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];

    expect(url).toBe(baseConfig.webhookUrl);
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });

    const body = JSON.parse(init.body as string);
    expect(body.attachments).toHaveLength(1);
    expect(body.attachments[0].color).toBe("#EF4444"); // critical color
    expect(body.attachments[0].blocks[0].text.text).toContain(
      "Database connection lost"
    );
  });

  // ── Test 2: Network failure logs to stderr, does not throw ────────
  it("logs network errors to stderr without throwing", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    const client = new SlackAlertsClient(baseConfig);

    // Must not throw
    await expect(client.send(baseEvent)).resolves.toBeUndefined();

    // Must log to stderr (console.error)
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(
      /\[SlackAlerts\] TestApp: Failed to send alert/
    );
    expect(consoleErrorSpy.mock.calls[0][1]).toBe("ECONNREFUSED");
  });

  // ── Test 3: HTTP error response logs status and body ──────────────
  it("logs HTTP error responses to stderr without throwing", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response("channel_not_found", { status: 404 })
    );

    const client = new SlackAlertsClient(baseConfig);
    await expect(client.send(baseEvent)).resolves.toBeUndefined();

    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(/HTTP 404/);
    expect(consoleErrorSpy.mock.calls[0][0]).toMatch(/channel_not_found/);
  });

  // ── Test 4: Disabled client skips send entirely ───────────────────
  it("skips sending when disabled (no webhook, no botToken)", async () => {
    const client = new SlackAlertsClient({
      webhookUrl: "",
      appName: "Disabled",
      environment: "test",
    });

    expect(client.isEnabled()).toBe(false);
    await client.send(baseEvent);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // ── Test 5: Rate limiter dedup window ─────────────────────────────
  it("enforces rate limiting between rapid sends", async () => {
    fetchSpy.mockResolvedValue(new Response("ok", { status: 200 }));

    const client = new SlackAlertsClient({
      ...baseConfig,
      rateLimitMs: 50, // 50ms window for fast test
    });

    const start = Date.now();
    await client.send(baseEvent);
    await client.send(baseEvent);
    const elapsed = Date.now() - start;

    // Second call should have waited ~50ms
    expect(elapsed).toBeGreaterThanOrEqual(40); // allow small timing variance
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});

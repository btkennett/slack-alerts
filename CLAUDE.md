# @foundrynorth/slack-alerts — Slack Alert Client

## Package Info
- **npm**: `@foundrynorth/slack-alerts@1.1.0` (public)
- **Consumers**: fn-legacy, fn-flux
- **Module**: ESM (`"type": "module"`)

## API
| Export | Purpose |
|--------|---------|
| `SlackAlertsClient` | Main class — instantiate with `SlackAlertConfig`, call `.send(event)` |
| `formatSlackMessage` | Internal Block Kit payload formatter |
| `RateLimiter` | Deduplication utility (default 1000ms window) |
| `SEVERITY_MAP` | Severity → color + emoji mapping (critical, warning, success, info) |

### Config Interface
```typescript
SlackAlertConfig {
  webhookUrl: string;      // Slack Incoming Webhook URL
  appName: string;         // Source app identifier
  environment: string;     // e.g. "production"
  enabled?: boolean;       // Default true
  rateLimitMs?: number;    // Dedup window (default 1000)
  botToken?: string;       // For dynamic channel routing via chat.postMessage
}
```

## Key Design Decisions
- **Fire-and-forget**: `.send()` never throws — errors are swallowed silently
- **No Slack SDK dependency**: Uses native `fetch` for zero-dep footprint
- **Dual routing**: Webhook (fixed channel) or bot token (dynamic `channel` param)
- Note: fn-flux uses its own `getSlackClient()` singleton for Slack Web API calls (richer API), separate from this package

## Commands
```bash
npm run build          # Compile TypeScript (tsc)
npm version patch      # Bump version
npm publish            # Publish to npm (runs build via prepublishOnly)
```

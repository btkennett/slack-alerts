# @foundrynorth/slack-alerts

Fire-and-forget Slack alert client for Foundry North platforms. No Slack SDK dependency — uses raw webhook API.

## Install

```bash
npm install @foundrynorth/slack-alerts
```

## Usage

```typescript
import { slackClient } from "@foundrynorth/slack-alerts";

await slackClient.send({
  severity: "warning",      // "info" | "warning" | "error" | "critical"
  title: "Rate exception filed",
  message: "Order #1234 has a rate exception awaiting approval",
  metadata: { orderId: 1234, requestedRate: 15.50 },
});
```

Requires `SLACK_WEBHOOK_URL` environment variable.

## Consumers

- **fn-legacy** (Compass)
- **fn-flux** (Compass Ops)

## Full Documentation

See [fn-docs: Shared Packages](https://fn-docs.vercel.app/docs/compass-v2/shared-packages).

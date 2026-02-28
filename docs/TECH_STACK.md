# Tech Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| UI Framework | ClawUI Starter Kit (CopilotKit + React + Vite) | Provides hybrid @copilot/@clawpilot routing, Kanban/chat surfaces, and tool registration. |
| Agents | Hybrid mode (Standalone LLM via OpenRouter + OpenClaw gateway) | @copilot handles reasoning + summaries; @clawpilot executes automations via OpenClaw. |
| Relay Backend | Node.js (Express + SQLite/Prisma or Supabase) | Stores relay packets, statuses, and provides REST/WebSocket API for UI + agents. |
| Data Ingestion | Node scripts / serverless cron pulling civic APIs | Feeds event/weather/transit/civic datasets into each neighborhood context. |
| Visualization | React (Mapbox GL / deck.gl, D3) | Renders Seattle neighborhoods, packet flows, and status tiles. |
| Voice Layer | Vapi | Provides inbound/outbound voice calls for urgent relay narration + approvals. |
| Integrations | Composio, Auth0 AI Agents (stretch) | Trigger Slack/PagerDuty/etc. and gate risky actions. |

## Environment Variables
- `OPENAI_API_KEY` or `OPENROUTER_API_KEY` — LLM access for @copilot.
- `OPENCLAW_AGENT_URL`, `OPENCLAW_AGENT_TOKEN` — route @clawpilot.
- `VAPI_API_KEY` — voice notifications.
- `COMPOSIO_API_KEY` (optional) — multi-app actions.
- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` (optional) — approvals.
- `RELAY_SERVICE_URL` — base URL for the relay backend consumed by UI + agents.

## Tooling Notes
- Use `pnpm` for consistency across ui + services.
- Keep OpenClaw gateway running locally or remote; register tools for runbooks (e.g., `dispatch_slack_alert`, `scale_capacity`).
- For rapid prototyping, fallback to mock JSON feeds under `services/relay-service/data/` until API keys are ready.

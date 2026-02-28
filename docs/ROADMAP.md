# Build Roadmap

## Phase 0 — Setup (0.5h)
- [ ] Clone ClawUI into `ui/`, install deps, configure .env (Hybrid mode).
- [ ] Install OpenClaw gateway tools (mock runbooks, Slack dispatch, data fetchers).
- [ ] Generate neighborhood GeoJSON + baseline mock data.

## Phase 1 — Relay Backbone (1h)
- [ ] Scaffold `services/relay-service` (Express, SQLite via Prisma).
- [ ] Endpoints: `POST /relay`, `GET /relay`, `PATCH /relay/:id`, `GET /stream` (SSE/WebSocket).
- [ ] Seed with sample packets for two neighborhoods.

## Phase 2 — UI Integration (1.5h)
- [ ] Add Seattle map + neighborhood cards to ClawUI.
- [ ] Display live relays (list + timeline) and highlight impacted areas.
- [ ] Enable @copilot command to “show relay detail” and @clawpilot button to run mitigation tool.

## Phase 3 — Data & Automation (1h)
- [ ] Connect external feeds or mocked cron jobs producing realistic payloads.
- [ ] Implement impact scoring + urgent threshold logic.
- [ ] Register OpenClaw tools (e.g., `dispatch_slack_alert`, `scale_capacity`).

## Phase 4 — Voice + Approvals (stretch)
- [ ] Configure Vapi webhook for urgent relays → outbound call script.
- [ ] Integrate Auth0 AI Agents for approve/deny of risky actions.
- [ ] Add Composio-powered cross-tool action (e.g., create incident in PagerDuty).

## Demo Checklist
- Two neighborhoods exchanging relays triggered from mock/live data.
- Visualization of relay flow + status timeline.
- Agent executing mitigation with logged output.
- Optional voice alert or approval sequence recorded.

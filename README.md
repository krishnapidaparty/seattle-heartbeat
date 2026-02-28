# Seattle Heartbeat

Seattle Heartbeat is a neighborhood-to-neighborhood relay network for civic operations. Autonomous agents monitor local signals (events, traffic, emergencies) within each Seattle neighborhood, package urgent findings into structured "relay" packets, and coordinate pre-emptive responses across the city via ClawUI, OpenClaw, and external data feeds.

## Repo Layout

```
seattle-heartbeat/
├── README.md                # Top-level overview
├── docs/                    # Detailed specs, architecture, and planning
├── ui/                      # ClawUI hybrid workspace configuration (see docs/ui-setup)
└── services/
    └── relay-service/       # Lightweight service for relay packets (Node/Express)
```

## Quick Start

1. **Install prerequisites**
   - Node.js 22+
   - pnpm (preferred) or npm
   - Git, OpenClaw CLI configured with gateway access

2. **Clone ClawUI Starter Kit into `ui/`**
   ```bash
   cd ui
   git clone https://github.com/GeneralJerel/clawuikit.git .
   pnpm install
   cp .env.example .env
   # Fill in OpenRouter/OpenAI + OpenClaw gateway credentials
   ```

3. **Relay service**
   ```bash
   cd services/relay-service
   pnpm install
   pnpm dev
   ```
   The service exposes simple REST/WebSocket endpoints for relay packets.

4. **Run ClawUI in Hybrid mode**
   ```bash
   cd ui
   pnpm dev
   ```

5. **Wire agents + integrations** by following the docs in `/docs`.

## Resources
- [ClawUI Starter Kit](https://github.com/GeneralJerel/clawuikit)
- [OpenClaw Docs](https://docs.openclaw.ai)
- [CopilotKit](https://www.copilotkit.ai/)
- [Vapi](https://vapi.ai)
- [Composio](https://composio.dev)
- [Auth0 for AI Agents](https://auth0.com/ai)

# Sponsor Integrations & Resources

## CopilotKit / ClawUI
- Repo: https://github.com/GeneralJerel/clawuikit
- Setup: clone into `ui/`, `pnpm install`, `cp .env.example .env`
- Modes: Standalone, OpenClaw, Hybrid (set `CLAWPILOT_MODE`)
- Key features: multi-agent chat, tool registration, state exposure, live tool execution.

## Vapi (Voice AI)
- Credits code: `Openclaw022026`
- Setup: https://dashboard.vapi.ai/org/api-keys → set `VAPI_API_KEY`
- Skills: setup-api-key, create-assistant, create-call, etc.
- Use case: urgent relay voice briefings + approvals.

## Composio
- Install: `npm install @composio/core @composio/openai-agents`
- API key: https://platform.composio.dev/settings
- Role: connect agents to 1000+ SaaS tools (Slack, PagerDuty, etc.).

## OpenRouter
- Credits: redeem city-specific code at https://openrouter.ai/redeem
- SDK: `npm install @openrouter/sdk`
- Use: LLM provider for @copilot (Hybrid mode), pointing OpenAI SDK base URL to OpenRouter if preferred.

## Auth0 for AI Agents
- Docs: https://auth0.com/ai
- Capabilities: OAuth login, token vault, human approvals, fine-grained authorization.
- Use: gate risky mitigations (dispatch, reroutes).

## ElevenLabs
- Account/API: https://elevenlabs.io
- Functions: text-to-speech, streaming, voice cloning; optional for richer voice briefings.

Reference this file to remember sponsor resources + how they plug into Seattle Heartbeat.

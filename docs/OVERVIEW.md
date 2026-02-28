# Seattle Heartbeat — Overview

Seattle Heartbeat turns Seattle neighborhoods into collaborating agent nodes. Each neighborhood watches local city APIs, computes impact scores, and relays urgent tasks so other areas can pre-stage resources (police, fire, hospitals, mobility, infra).

## Objectives
- Provide a **multi-neighborhood situational map** with live data tiles and relay flow visualization.
- Let autonomous agents (@copilot, @clawpilot) exchange structured packets describing incidents, severity, and requested actions.
- Trigger **voice alerts** (Vapi) and require optional human approvals (Auth0 AI Agents) for high-stakes mitigations.
- Showcase interoperable tooling across OpenClaw, CopilotKit, Composio, Vapi, and external civic APIs within a single demo.

## Key Use Cases
1. Accident cascades affecting multiple neighborhoods.
2. Fire load balancing across adjacent stations.
3. Hospital surge coordination during citywide spikes.
4. Severe weather micro-zones (wind, flooding, heat).
5. Public safety events (protests, stadium games) spilling into nearby areas.

## Success Criteria
- **Working UI** with at least two neighborhoods exchanging live packets.
- **Relay backend** storing packets with status transitions (Detected → Acked → In Action → Resolved).
- **Agent flows** that: detect thresholds, compose packets, trigger actions (mocked or real via OpenClaw tools).
- **Visualization** showing packet trajectories and neighborhood status.
- **Voice notification** demo path via Vapi for urgent packets.

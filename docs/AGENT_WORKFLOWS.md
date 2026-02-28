# Agent Workflows

## Neighborhood Monitor (@copilot)
1. **Ingest Context**: Pull latest data snapshot for assigned neighborhood.
2. **Score Events**: Compute `impactScore` and `urgencyBand`.
3. **Compose Relay Packet** when threshold met:
   ```json
   {
     "id": "relay_soDo_20260228_1",
     "origin": "SoDo",
     "category": "accident",
     "impactScore": 0.87,
     "window": "now→+45m",
     "requestedActions": [
       "pre-stage ambulances in Pioneer Square",
       "reroute freight via Spokane St"
     ],
     "attachments": {
       "dataLinks": ["https://data.seattle.gov/..."],
       "map": "geojson download"
     }
   }
   ```
4. **Send Relay**: POST to relay service API; mention receiving neighborhoods via @clawpilot in ClawUI thread.
5. **Monitor Status**: Update packet notes as conditions change.

## Response / Mitigation (@clawpilot)
1. **Receive Packet**: UI shows card + alert; agent subscribes to relay channel.
2. **Acknowledge**: `PATCH /relay/{id}` set status `acknowledged` with timestamp.
3. **Propose Action Plan**: Evaluate runbooks (scale infra, dispatch notifications, reroute transit). Use OpenClaw registered tools to execute.
4. **Optional Human Approval**: If flagged, create Auth0 AI Agents approval request, await decision (voice or UI). Log rationale.
5. **Execute + Update**: Run actions through OpenClaw/Composio; update packet status `in_action` → `resolved` when done.
6. **Notify**: Send summary back to origin neighborhood and broadcast via Vapi if urgent.

## Voice Alert Flow (Vapi)
- Relay service emits webhook for `priority == urgent` packets.
- Vapi skill creates outbound call script summarizing origin, impact, recommended action.
- Callee responds via DTMF or voice (“approve mitigation”), which hits callback to mark approval.

## Status Lifecycle
`detected → queued → acknowledged → in_action → resolved → archived`

Each transition is recorded for audit, and the UI timeline visualizes progress per packet.

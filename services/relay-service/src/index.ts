import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ?? 4001;
const relays: Record<string, RelayPacket> = {};
const listeners = new Set<WebSocket>();

type RelayStatus = 'detected' | 'queued' | 'acknowledged' | 'in_action' | 'resolved';

type RelayPacket = {
  id: string;
  origin: string;
  targets: string[];
  category: string;
  impactScore: number;
  urgency: 'normal' | 'urgent';
  window: string;
  requestedActions: string[];
  status: RelayStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
};

const server = app.listen(PORT, () => {
  console.log(`Relay service listening on :${PORT}`);
});

const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (socket) => {
  listeners.add(socket);
  console.log('listener connected');

  socket.send(JSON.stringify({ type: 'snapshot', data: Object.values(relays) }));
  socket.on('close', () => listeners.delete(socket));
});

function broadcast(payload: unknown) {
  const message = JSON.stringify(payload);
  listeners.forEach((ws) => {
    if (ws.readyState === ws.OPEN) ws.send(message);
  });
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, relays: Object.keys(relays).length });
});

app.get('/relay', (_req, res) => {
  res.json(Object.values(relays));
});

app.post('/relay', (req, res) => {
  const id = req.body.id ?? `relay_${nanoid(6)}`;
  const now = new Date().toISOString();
  const packet: RelayPacket = {
    id,
    origin: req.body.origin,
    targets: req.body.targets ?? [],
    category: req.body.category ?? 'general',
    impactScore: req.body.impactScore ?? 0,
    urgency: req.body.urgency ?? 'normal',
    window: req.body.window ?? 'now',
    requestedActions: req.body.requestedActions ?? [],
    status: 'detected',
    createdAt: now,
    updatedAt: now,
    notes: req.body.notes,
  };

  relays[id] = packet;
  broadcast({ type: 'relay.created', data: packet });
  res.status(201).json(packet);
});

app.patch('/relay/:id', (req, res) => {
  const packet = relays[req.params.id];
  if (!packet) return res.status(404).json({ error: 'not_found' });

  const updated: RelayPacket = {
    ...packet,
    status: req.body.status ?? packet.status,
    notes: req.body.notes ?? packet.notes,
    updatedAt: new Date().toISOString(),
  };

  relays[packet.id] = updated;
  broadcast({ type: 'relay.updated', data: updated });
  res.json(updated);
});

app.delete('/relay/:id', (req, res) => {
  if (!relays[req.params.id]) return res.status(404).json({ error: 'not_found' });
  const removed = relays[req.params.id];
  delete relays[req.params.id];
  broadcast({ type: 'relay.deleted', data: removed });
  res.status(204).send();
});

// Seed sample data for demo
app.post('/seed', (_req, res) => {
  const seedPackets: Omit<RelayPacket, 'createdAt' | 'updatedAt'>[] = [
    {
      id: 'relay_sodo_demo',
      origin: 'SoDo',
      targets: ['PioneerSquare', 'Ballard'],
      category: 'accident',
      impactScore: 0.87,
      urgency: 'urgent',
      window: 'now→+45m',
      requestedActions: [
        'Pre-stage ambulances in Pioneer Square',
        'Reroute freight via Spokane St detour',
      ],
      status: 'queued',
      notes: 'Multi-vehicle crash near Lumen Field exit.',
    },
  ];

  seedPackets.forEach((packet) => {
    const now = new Date().toISOString();
    relays[packet.id] = { ...packet, createdAt: now, updatedAt: now };
  });

  broadcast({ type: 'relay.snapshot', data: Object.values(relays) });
  res.json({ ok: true, count: seedPackets.length });
});

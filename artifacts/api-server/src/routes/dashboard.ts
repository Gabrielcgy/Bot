import { Router } from "express";
import { connectionState } from "../bot/connectionState.js";
import { dashboardState } from "../bot/dashboardState.js";
import { BOT_NAME, BOT_VERSION, BOT_START_TIME, OWNER_NAME } from "../bot/config.js";
import { formatUptime } from "../bot/utils/index.js";

const router = Router();

// ── API: estado del bot en JSON ────────────────────────────────────────────
router.get("/api/bot-status", (_req, res) => {
  const uptimeMs = Date.now() - BOT_START_TIME;
  const mem = process.memoryUsage();
  res.json({
    status: connectionState.status,
    needsPairing: dashboardState.needsPairing,
    pairingCode: dashboardState.pairingCode,
    pairingCodeAge: dashboardState.pairingCodeGeneratedAt
      ? Math.round((Date.now() - dashboardState.pairingCodeGeneratedAt) / 1000)
      : null,
    uptime: formatUptime(uptimeMs),
    botName: BOT_NAME,
    version: BOT_VERSION,
    owner: OWNER_NAME,
    memMB: Math.round(mem.heapUsed / 1024 / 1024),
    reconnectAttempts: connectionState.reconnectAttempts,
    connectedAt: connectionState.connectedAt?.toISOString() ?? null,
    nodeVersion: process.version,
  });
});

// ── Panel web ──────────────────────────────────────────────────────────────
router.get("/panel", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(getDashboardHTML());
});

function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>KILLERCG — Panel de Control</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #0a0a0f;
      color: #e2e8f0;
      min-height: 100vh;
      padding: 20px;
    }

    .header {
      text-align: center;
      padding: 30px 20px 20px;
    }

    .header h1 {
      font-size: 2.2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #25d366, #128c7e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 2px;
    }

    .header p {
      color: #64748b;
      margin-top: 6px;
      font-size: 0.9rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      max-width: 900px;
      margin: 24px auto;
    }

    .card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 16px;
      padding: 24px;
      transition: border-color 0.3s;
    }

    .card:hover { border-color: #374151; }

    .card-title {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #4b5563;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 1rem;
    }

    .status-connected    { background: #14532d; color: #4ade80; }
    .status-connecting   { background: #78350f; color: #fbbf24; }
    .status-disconnected { background: #7f1d1d; color: #f87171; }

    .dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    .dot-green  { background: #4ade80; box-shadow: 0 0 8px #4ade80; }
    .dot-yellow { background: #fbbf24; box-shadow: 0 0 8px #fbbf24; }
    .dot-red    { background: #f87171; box-shadow: 0 0 8px #f87171; }

    @keyframes pulse {
      0%,100% { opacity:1; }
      50% { opacity:.4; }
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      color: #f1f5f9;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #64748b;
      margin-top: 4px;
    }

    /* ── Pairing code card ─────────────────────────────────────────── */
    .pairing-card {
      background: linear-gradient(135deg, #1a1000, #0f2010);
      border: 1.5px solid #854d0e;
      max-width: 900px;
      margin: 0 auto 20px;
      border-radius: 16px;
      padding: 28px 32px;
      display: none;
    }

    .pairing-card.visible { display: block; }

    .pairing-card .alert-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fbbf24;
      margin-bottom: 6px;
    }

    .pairing-card .alert-sub {
      color: #92400e;
      font-size: 0.85rem;
      margin-bottom: 20px;
    }

    .pairing-code {
      font-family: 'Courier New', monospace;
      font-size: 2.5rem;
      font-weight: 900;
      letter-spacing: 6px;
      color: #fbbf24;
      background: #1c1400;
      border: 2px solid #854d0e;
      border-radius: 12px;
      padding: 16px 24px;
      display: inline-block;
      margin-bottom: 16px;
    }

    .steps {
      list-style: none;
      counter-reset: step;
    }
    .steps li {
      counter-increment: step;
      padding: 6px 0 6px 36px;
      position: relative;
      color: #d97706;
      font-size: 0.9rem;
    }
    .steps li::before {
      content: counter(step);
      position: absolute; left: 0;
      width: 24px; height: 24px;
      background: #854d0e;
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.8rem;
      display: flex; align-items: center; justify-content: center;
      color: #fef3c7;
    }

    /* ── Connected card ────────────────────────────────────────────── */
    .connected-banner {
      max-width: 900px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #052e16, #0f2a1a);
      border: 1.5px solid #15803d;
      border-radius: 16px;
      padding: 20px 28px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .connected-banner .icon { font-size: 2rem; }

    .connected-banner .text strong {
      display: block;
      font-size: 1.1rem;
      color: #4ade80;
      font-weight: 700;
    }

    .connected-banner .text span {
      font-size: 0.85rem;
      color: #166534;
    }

    footer {
      text-align: center;
      color: #1f2937;
      font-size: 0.8rem;
      padding: 30px;
    }

    .refresh-note {
      text-align: center;
      color: #374151;
      font-size: 0.78rem;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>

  <div class="header">
    <h1>⚡ KILLERCG</h1>
    <p>Panel de control del bot de WhatsApp</p>
  </div>

  <!-- Banner conectado -->
  <div class="connected-banner" id="connectedBanner" style="display:none">
    <span class="icon">✅</span>
    <div class="text">
      <strong>Bot conectado y funcionando</strong>
      <span id="connectedSince">—</span>
    </div>
  </div>

  <!-- Pairing code (cuando no está vinculado) -->
  <div class="pairing-card" id="pairingCard">
    <div class="alert-title">⚠️ El bot necesita vincularse a WhatsApp</div>
    <div class="alert-sub">Ingresá este código en WhatsApp para conectar el bot:</div>
    <div class="pairing-code" id="pairingCodeText">----</div>
    <ol class="steps">
      <li>Abrí WhatsApp en tu teléfono</li>
      <li>Tocá ⚙️ Ajustes → Dispositivos vinculados</li>
      <li>Tocá "Vincular un dispositivo"</li>
      <li>Elegí "Vincular con número de teléfono"</li>
      <li>Ingresá el código de arriba</li>
    </ol>
    <p style="margin-top:14px;color:#6b7280;font-size:0.8rem">El código se genera automáticamente. Si expiró, el bot pedirá uno nuevo en ~30 segundos.</p>
  </div>

  <div class="refresh-note" id="refreshNote">Actualizando en <span id="countdown">5</span>s…</div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Estado de WhatsApp</div>
      <div class="status-badge status-disconnected" id="statusBadge">
        <span class="dot dot-red" id="statusDot"></span>
        <span id="statusText">Cargando...</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Tiempo activo</div>
      <div class="stat-value" id="uptime">—</div>
      <div class="stat-label">desde que arrancó el bot</div>
    </div>

    <div class="card">
      <div class="card-title">Memoria RAM</div>
      <div class="stat-value"><span id="memMB">—</span> <span style="font-size:1.2rem;color:#64748b">MB</span></div>
      <div class="stat-label">heap usado</div>
    </div>

    <div class="card">
      <div class="card-title">Reconexiones</div>
      <div class="stat-value" id="reconnects">—</div>
      <div class="stat-label">veces que el bot reconectó</div>
    </div>

    <div class="card">
      <div class="card-title">Versión</div>
      <div class="stat-value" style="font-size:1.4rem" id="version">—</div>
      <div class="stat-label" id="nodeVer">Node.js —</div>
    </div>

    <div class="card">
      <div class="card-title">Owner</div>
      <div class="stat-value" style="font-size:1.4rem" id="owner">—</div>
      <div class="stat-label">administrador del bot</div>
    </div>
  </div>

  <footer>KILLERCG v<span id="footerVersion">—</span> • Panel de control</footer>

<script>
let countdown = 5;

async function refresh() {
  try {
    const res = await fetch('/api/bot-status');
    const d = await res.json();

    // Status badge
    const badge = document.getElementById('statusBadge');
    const dot   = document.getElementById('statusDot');
    const text  = document.getElementById('statusText');
    badge.className = 'status-badge status-' + d.status;
    dot.className   = 'dot ' + (d.status==='connected'?'dot-green':d.status==='connecting'?'dot-yellow':'dot-red');
    text.textContent = d.status==='connected'?'Conectado ✅':d.status==='connecting'?'Conectando...':'Desconectado';

    // Pairing card
    const pairingCard    = document.getElementById('pairingCard');
    const connectedBanner = document.getElementById('connectedBanner');
    if (d.needsPairing && d.pairingCode) {
      pairingCard.classList.add('visible');
      connectedBanner.style.display = 'none';
      document.getElementById('pairingCodeText').textContent = d.pairingCode;
    } else if (d.status === 'connected') {
      pairingCard.classList.remove('visible');
      connectedBanner.style.display = 'flex';
      if (d.connectedAt) {
        const since = new Date(d.connectedAt);
        document.getElementById('connectedSince').textContent =
          'Conectado desde ' + since.toLocaleTimeString('es', {hour:'2-digit',minute:'2-digit'});
      }
    } else {
      pairingCard.classList.remove('visible');
      connectedBanner.style.display = 'none';
    }

    // Stats
    document.getElementById('uptime').textContent    = d.uptime ?? '—';
    document.getElementById('memMB').textContent     = d.memMB ?? '—';
    document.getElementById('reconnects').textContent = d.reconnectAttempts ?? '0';
    document.getElementById('version').textContent   = 'v' + d.version;
    document.getElementById('owner').textContent     = d.owner ?? '—';
    document.getElementById('nodeVer').textContent   = 'Node.js ' + d.nodeVersion;
    document.getElementById('footerVersion').textContent = d.version;
  } catch(e) {
    document.getElementById('statusText').textContent = 'Sin conexión con el servidor';
  }
}

// Countdown + auto-refresh
function tick() {
  countdown--;
  document.getElementById('countdown').textContent = countdown;
  if (countdown <= 0) {
    countdown = 5;
    refresh();
  }
}

refresh();
setInterval(tick, 1000);
</script>
</body>
</html>`;
}

export default router;

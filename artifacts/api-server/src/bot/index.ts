import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { rmSync, existsSync } from "fs";
import { logger } from "../lib/logger.js";
import { onMessage } from "./events/onMessage.js";
import { onGroupUpdate } from "./events/onGroupUpdate.js";
import { connectionState } from "./connectionState.js";

const MIN_RECONNECT_DELAY = 5_000;
const MAX_RECONNECT_DELAY = 60_000;
const WATCHDOG_INTERVAL_MS = 2 * 60_000;   // cada 2 min
const SILENCE_TIMEOUT_MS  = 15 * 60_000;   // 15 min sin ningún evento = reconectar

const AUTH_FOLDER = "./auth";

let isReconnecting = false;

// ── Backoff progresivo ─────────────────────────────────────────────────────
function getReconnectDelay(): number {
  return Math.floor(
    Math.min(
      MIN_RECONNECT_DELAY * Math.pow(1.5, connectionState.reconnectAttempts),
      MAX_RECONNECT_DELAY,
    ),
  );
}

// ── Borrar carpeta de auth (sesión inválida) ───────────────────────────────
function clearAuth(): void {
  try {
    if (existsSync(AUTH_FOLDER)) {
      rmSync(AUTH_FOLDER, { recursive: true, force: true });
      logger.info("[INFO] Carpeta ./auth eliminada — se pedirá nuevo código");
    }
  } catch (err) {
    logger.error({ err }, "[ERROR] No se pudo eliminar ./auth");
  }
}

// ── Punto único de reconexión (evita doble-connect) ───────────────────────
function scheduleReconnect(reason: string, resetAuth = false): void {
  if (isReconnecting) return;
  isReconnecting = true;
  connectionState.status = "disconnected";
  if (resetAuth) clearAuth();
  const delay = resetAuth ? 8_000 : getReconnectDelay();
  connectionState.reconnectAttempts++;
  logger.info(
    { reason, delay: `${Math.round(delay / 1000)}s`, attempt: connectionState.reconnectAttempts },
    "[INFO] Reconectando...",
  );
  setTimeout(() => {
    connect().catch((err) => logger.error({ err }, "[ERROR] Error al reconectar"));
  }, delay);
}

// ── Conexión principal ─────────────────────────────────────────────────────
async function connect(): Promise<void> {
  isReconnecting = false;
  connectionState.lastActivityMs = Date.now();

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    connectTimeoutMs: 60_000,
    keepAliveIntervalMs: 25_000,
    retryRequestDelayMs: 2_000,
    maxMsgRetryCount: 2,
  });

  connectionState.currentSock = sock;

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr, receivedPendingNotifications } = update;
    connectionState.lastActivityMs = Date.now();

    if (receivedPendingNotifications) {
      logger.info("[INFO] Notificaciones pendientes recibidas");
    }

    if (connection === "open") {
      connectionState.status = "connected";
      connectionState.connectedAt = new Date();
      connectionState.reconnectAttempts = 0;
      isReconnecting = false;
      logger.info("[OK] ✅ KILLERCG ONLINE — Conectado a WhatsApp");
    }

    if (connection === "connecting") {
      connectionState.status = "connecting";
      logger.info("[INFO] Conectando a WhatsApp...");
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

      if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
        // ── Sesión cerrada por WhatsApp (kicked out, banned, o expirada) ──
        logger.warn(
          { statusCode },
          "[WARN] ⚠️  Sesión cerrada por WhatsApp — borrando auth y pidiendo nuevo código...",
        );
        // resetAuth=true: borra ./auth y vuelve a conectar con pairing code nuevo
        scheduleReconnect("logged-out", true);
      } else if (statusCode === 429) {
        logger.warn({ statusCode }, "[WARN] Rate limit de WhatsApp — esperando...");
        scheduleReconnect("rate-limit");
      } else if (statusCode === 408) {
        logger.warn({ statusCode }, "[WARN] Timeout de conexión");
        scheduleReconnect("timeout");
      } else if (statusCode === 503) {
        logger.warn({ statusCode }, "[WARN] Servicio de WhatsApp no disponible");
        scheduleReconnect("wa-unavailable");
      } else {
        logger.warn({ statusCode }, "[WARN] Conexión cerrada");
        scheduleReconnect(`statusCode=${String(statusCode)}`);
      }
    }

    if (qr) {
      logger.info("[INFO] QR generado (modo pairing code — no se usa QR)");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    connectionState.lastActivityMs = Date.now();
    if (type !== "notify") return;
    await onMessage(sock, messages);
  });

  sock.ev.on("group-participants.update", async (update) => {
    connectionState.lastActivityMs = Date.now();
    await onGroupUpdate(sock, update);
  });

  if (!state.creds.registered) {
    const phone = process.env["WA_PHONE_NUMBER"]!;
    logger.info({ phone }, "📱 Solicitando código de emparejamiento...");
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phone);
        logger.info(
          `\n\n╔══════════════════════════════╗\n║  🔑 CÓDIGO DE EMPAREJAMIENTO  ║\n╠══════════════════════════════╣\n║  ${code}  ║\n╚══════════════════════════════╝\n`,
        );
        logger.info({ code }, "🔑 Código de emparejamiento listo");
      } catch (err) {
        logger.error({ err }, "[ERROR] al solicitar código de emparejamiento");
      }
    }, 3_000);
  }
}

// ── Watchdog — detecta silencio prolongado ─────────────────────────────────
setInterval(() => {
  if (isReconnecting) return;
  if (connectionState.status !== "connected") return;

  const silentMs = Date.now() - connectionState.lastActivityMs;
  if (silentMs > SILENCE_TIMEOUT_MS) {
    logger.warn(
      { silentMin: Math.round(silentMs / 60_000) },
      "[WARN] Sin actividad de WhatsApp — reconexión preventiva",
    );
    scheduleReconnect("watchdog-silence");
  }
}, WATCHDOG_INTERVAL_MS).unref();

// ── Entry point ────────────────────────────────────────────────────────────
export async function startBot(): Promise<void> {
  const phone = process.env["WA_PHONE_NUMBER"];
  if (!phone) {
    logger.warn("⚠️  WA_PHONE_NUMBER no configurado. El bot no iniciará.");
    return;
  }
  logger.info({ phone }, "🚀 Iniciando KILLERCG...");
  await connect();
}

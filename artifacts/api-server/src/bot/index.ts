import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { logger } from "../lib/logger.js";
import { onMessage } from "./events/onMessage.js";
import { onGroupUpdate } from "./events/onGroupUpdate.js";

async function connect(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      logger.info("✅ BOT ONLINE — WhatsApp conectado correctamente");
    }

    if (connection === "close") {
      const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = reason !== DisconnectReason.loggedOut;

      logger.warn({ reason }, "⚠️ Conexión cerrada");

      if (shouldReconnect) {
        logger.info("🔄 Reconectando en 5 segundos...");
        setTimeout(() => {
          connect().catch((err) =>
            logger.error({ err }, "Error al reconectar"),
          );
        }, 5000);
      } else {
        logger.warn(
          "🚪 Sesión cerrada (logged out). Elimina la carpeta ./auth y reinicia para vincular de nuevo.",
        );
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    await onMessage(sock, messages);
  });

  sock.ev.on("group-participants.update", async (update) => {
    await onGroupUpdate(sock, update);
  });

  if (!state.creds.registered) {
    const phone = process.env["WA_PHONE_NUMBER"]!;
    logger.info({ phone }, "📱 Solicitando código de emparejamiento...");
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phone);
        logger.info(
          { code },
          "🔑 ===== CODIGO DE EMPAREJAMIENTO (ingresalo en WhatsApp) =====",
        );
      } catch (err) {
        logger.error({ err }, "Error al solicitar código de emparejamiento");
      }
    }, 3000);
  }
}

export async function startBot(): Promise<void> {
  const phone = process.env["WA_PHONE_NUMBER"];
  if (!phone) {
    logger.warn("⚠️  WA_PHONE_NUMBER no configurado. El bot no iniciará.");
    return;
  }
  logger.info({ phone }, "🚀 Iniciando bot de WhatsApp...");
  await connect();
}

import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import { logger } from "./lib/logger";

export async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (u) => {
    const { connection } = u;

    if (connection === "open") {
      logger.info("BOT ONLINE");
    }

    if (!state.creds.registered) {
      const phone = process.env["WA_PHONE_NUMBER"];
      if (!phone) {
        logger.warn(
          "WA_PHONE_NUMBER env var no configurado. Agrega tu número (ej: 595XXXXXXXXX) para obtener el código de emparejamiento.",
        );
        return;
      }
      const code = await sock.requestPairingCode(phone);
      logger.info({ code }, "CODIGO DE EMPAREJAMIENTO");
    }
  });

  return sock;
}

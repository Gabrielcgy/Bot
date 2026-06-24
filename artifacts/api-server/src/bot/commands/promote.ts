import type { Command } from "./types.js";
import { getMentioned, normalizeJid } from "../utils/index.js";

export const promote: Command = {
  name: "promote",
  description: "Promueve a admin a un usuario",
  usage: "promote @usuario",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, msg }) {
    const mentioned = getMentioned(msg).map(normalizeJid);
    if (!mentioned.length) {
      await sock.sendMessage(from, {
        text: "❌ Menciona a quien promover. Ej: .promote @usuario",
      });
      return;
    }
    try {
      await sock.groupParticipantsUpdate(from, mentioned, "promote");
      await sock.sendMessage(from, {
        text: `⬆️ ${mentioned.length} usuario(s) promovido(s) a admin.`,
      });
    } catch {
      await sock.sendMessage(from, {
        text: "⚠️ No se pudo promover. ¿El bot tiene permisos de administrador?",
      });
    }
  },
};

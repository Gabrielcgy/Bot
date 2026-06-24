import type { Command } from "./types.js";
import { getMentioned, normalizeJid } from "../utils/index.js";

export const kick: Command = {
  name: "kick",
  description: "Expulsa a un usuario del grupo",
  usage: "kick @usuario",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, msg }) {
    const mentioned = getMentioned(msg).map(normalizeJid);
    if (!mentioned.length) {
      await sock.sendMessage(from, {
        text: "❌ Menciona a alguien para expulsar. Ej: .kick @usuario",
      });
      return;
    }
    try {
      await sock.groupParticipantsUpdate(from, mentioned, "remove");
      await sock.sendMessage(from, {
        text: `✅ ${mentioned.length} usuario(s) expulsado(s).`,
      });
    } catch {
      await sock.sendMessage(from, {
        text: "⚠️ No se pudo expulsar. ¿El bot tiene permisos de administrador?",
      });
    }
  },
};

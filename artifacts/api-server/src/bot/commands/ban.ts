import type { Command } from "./types.js";
import { getMentioned, normalizeJid } from "../utils/index.js";

export const ban: Command = {
  name: "ban",
  description: "Expulsa a un usuario con motivo",
  usage: "ban @usuario motivo",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, msg, args, sender }) {
    const mentioned = getMentioned(msg).map(normalizeJid);
    if (!mentioned.length) {
      await sock.sendMessage(from, {
        text: "❌ Debes mencionar un usuario.\n\nEjemplo: .ban @usuario Spam",
      });
      return;
    }
    const motivo = args.filter((a) => !a.startsWith("@")).join(" ") || "Sin motivo";
    try {
      await sock.groupParticipantsUpdate(from, mentioned, "remove");
      const names = mentioned.map((j) => `@${j.split("@")[0]}`).join(", ");
      await sock.sendMessage(from, {
        text: `🚫 *USUARIO EXPULSADO*\n\n👤 Usuario: ${names}\n👮 Administrador: @${sender.split("@")[0]}\n📌 Motivo: ${motivo}`,
        mentions: [...mentioned, sender],
      });
    } catch {
      await sock.sendMessage(from, {
        text: "⚠️ No se pudo expulsar. ¿El bot tiene permisos de administrador?",
      });
    }
  },
};

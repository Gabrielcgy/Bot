import type { Command } from "./types.js";
import { getGroupSettings } from "../state.js";
import { getMentioned, normalizeJid } from "../utils/index.js";

export const mute: Command = {
  name: "mute",
  description: "Silencia a un usuario (borra sus mensajes automáticamente)",
  usage: "mute @usuario",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, msg }) {
    const mentioned = getMentioned(msg).map(normalizeJid);
    if (!mentioned.length) {
      await sock.sendMessage(from, {
        text: "❌ Etiqueta a quien quieres silenciar. Ej: .mute @usuario",
      });
      return;
    }
    const settings = getGroupSettings(from);
    const added: string[] = [];
    for (const jid of mentioned) {
      settings.mutedUsers.add(jid);
      added.push(`@${jid.split("@")[0]}`);
    }
    await sock.sendMessage(from, {
      text: `🔇 ${added.join(", ")} silenciado(s). Sus mensajes serán eliminados automáticamente.\nUsa *.unmute @usuario* para reactivarlos.`,
      mentions: mentioned,
    });
  },
};

import type { Command } from "./types.js";
import { getGroupSettings, saveState } from "../state.js";
import { getMentioned, normalizeJid } from "../utils/index.js";

export const unmute: Command = {
  name: "unmute",
  description: "Reactiva a un usuario silenciado",
  usage: "unmute @usuario",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, msg }) {
    const mentioned = getMentioned(msg).map(normalizeJid);
    if (!mentioned.length) {
      await sock.sendMessage(from, {
        text: "❌ Etiqueta a quien quieres reactivar. Ej: .unmute @usuario",
      });
      return;
    }
    const settings = getGroupSettings(from);
    const removed: string[] = [];
    const notFound: string[] = [];
    for (const jid of mentioned) {
      if (settings.mutedUsers.has(jid)) {
        settings.mutedUsers.delete(jid);
        removed.push(`@${jid.split("@")[0]}`);
      } else {
        notFound.push(`@${jid.split("@")[0]}`);
      }
    }
    if (removed.length) saveState();
    let text = "";
    if (removed.length) text += `🔊 ${removed.join(", ")} reactivado(s).\n`;
    if (notFound.length) text += `⚠️ ${notFound.join(", ")} no estaba(n) silenciado(s).`;
    await sock.sendMessage(from, { text: text.trim(), mentions: mentioned });
  },
};

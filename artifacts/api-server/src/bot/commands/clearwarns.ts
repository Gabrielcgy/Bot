import type { Command } from "./types.js";
import { getGroupSettings, saveState } from "../state.js";
import { getMentioned, normalizeJid } from "../utils/index.js";

export const clearwarns: Command = {
  name: "clearwarns",
  description: "Borra las advertencias de un usuario",
  usage: "clearwarns @usuario",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, msg }) {
    const mentioned = getMentioned(msg).map(normalizeJid);
    if (!mentioned.length) {
      await sock.sendMessage(from, {
        text: "❌ Etiqueta a quien quieres limpiar. Ej: .clearwarns @usuario",
      });
      return;
    }
    const settings = getGroupSettings(from);
    const cleared: string[] = [];
    for (const jid of mentioned) {
      settings.warnings.delete(jid);
      settings.warnReasons.delete(jid);
      cleared.push(`@${jid.split("@")[0]}`);
    }
    saveState();
    await sock.sendMessage(from, {
      text: `✅ Advertencias borradas para: ${cleared.join(", ")}`,
      mentions: mentioned,
    });
  },
};

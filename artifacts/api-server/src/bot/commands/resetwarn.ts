import type { Command } from "./types.js";
import { getGroupSettings, saveState } from "../state.js";
import { getMentioned, normalizeJid } from "../utils/index.js";

export const resetwarn: Command = {
  name: "resetwarn",
  description: "Borra advertencias e historial de un usuario",
  usage: "resetwarn @usuario",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, msg }) {
    const mentioned = getMentioned(msg).map(normalizeJid);
    if (!mentioned.length) {
      await sock.sendMessage(from, {
        text: "❌ Debes mencionar un usuario.\n\nEjemplo: .resetwarn @usuario",
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
      text: `✅ *Advertencias borradas*\n\n👤 Usuario(s): ${cleared.join(", ")}\n\n_Historial limpiado correctamente._`,
      mentions: mentioned,
    });
  },
};

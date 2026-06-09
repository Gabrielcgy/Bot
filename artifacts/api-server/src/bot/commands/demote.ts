import type { Command } from "./types.js";
import { getMentioned, normalizeJid } from "../utils/index.js";

export const demote: Command = {
  name: "demote",
  description: "Quita admin a un usuario",
  usage: "demote @usuario",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, msg }) {
    const mentioned = getMentioned(msg).map(normalizeJid);
    if (!mentioned.length) {
      await sock.sendMessage(from, {
        text: "❌ Menciona a quien degradar. Ej: .demote @usuario",
      });
      return;
    }
    await sock.groupParticipantsUpdate(from, mentioned, "demote");
    await sock.sendMessage(from, {
      text: `⬇️ ${mentioned.length} usuario(s) quitado(s) del admin.`,
    });
  },
};

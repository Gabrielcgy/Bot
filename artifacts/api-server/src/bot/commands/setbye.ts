import type { Command } from "./types.js";
import { setGroupSettings } from "../state.js";

export const setbye: Command = {
  name: "setbye",
  description: "Personaliza el mensaje de despedida",
  usage: "setbye <texto> — usa {user} y {group}",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, args, body }) {
    const text = body.slice(body.indexOf(" ") + 1).trim();
    if (!text || args.length === 0) {
      await sock.sendMessage(from, {
        text: "❌ Escribe el mensaje de despedida.\nEj: .setbye Adiós {user} 👋\n\n_Variables: {user} {group}_",
      });
      return;
    }
    setGroupSettings(from, { byeText: text });
    await sock.sendMessage(from, {
      text: `✅ Mensaje de despedida actualizado:\n\n_${text}_`,
    });
  },
};

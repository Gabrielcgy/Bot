import type { Command } from "./types.js";
import { setGroupSettings } from "../state.js";

export const setwelcome: Command = {
  name: "setwelcome",
  description: "Personaliza el mensaje de bienvenida",
  usage: "setwelcome <texto> — usa {user} y {group}",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, args, body }) {
    const text = body.slice(body.indexOf(" ") + 1).trim();
    if (!text || args.length === 0) {
      await sock.sendMessage(from, {
        text: "❌ Escribe el mensaje de bienvenida.\nEj: .setwelcome Bienvenido {user} al grupo {group} 🎉\n\n_Variables: {user} {group}_",
      });
      return;
    }
    setGroupSettings(from, { welcomeText: text });
    await sock.sendMessage(from, {
      text: `✅ Mensaje de bienvenida actualizado:\n\n_${text}_`,
    });
  },
};

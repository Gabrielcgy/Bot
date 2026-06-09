import type { Command } from "./types.js";

export const shutdown: Command = {
  name: "shutdown",
  description: "Apaga el bot",
  usage: "shutdown",
  ownerOnly: true,
  async execute({ sock, from }) {
    await sock.sendMessage(from, { text: "⛔ Apagando el bot... Hasta luego 👋" });
    setTimeout(() => process.exit(0), 1000);
  },
};

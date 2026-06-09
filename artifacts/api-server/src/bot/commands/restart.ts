import type { Command } from "./types.js";

export const restart: Command = {
  name: "restart",
  description: "Reinicia el bot",
  usage: "restart",
  ownerOnly: true,
  async execute({ sock, from }) {
    await sock.sendMessage(from, { text: "🔄 Reiniciando el bot..." });
    setTimeout(() => process.exit(1), 1000);
  },
};

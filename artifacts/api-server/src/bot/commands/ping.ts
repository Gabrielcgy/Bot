import type { Command } from "./types.js";

export const ping: Command = {
  name: "ping",
  description: "Verifica si el bot está activo",
  usage: "ping",
  async execute({ sock, from, msg }) {
    const start = Date.now();
    await sock.sendMessage(from, { text: "🏓 Calculando..." }, { quoted: msg as never });
    const ms = Date.now() - start;
    await sock.sendMessage(from, { text: `🏓 *Pong!* ${ms}ms` });
  },
};

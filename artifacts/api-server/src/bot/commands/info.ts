import type { Command } from "./types.js";
import { BOT_NAME, OWNER_NUMBER, PREFIX } from "../config.js";

export const info: Command = {
  name: "info",
  description: "Información del bot",
  usage: "info",
  async execute({ sock, from, msg }) {
    const text = `╔══════════════════╗
║   *${BOT_NAME}* 🤖
╠══════════════════╣
║ 👑 Owner: +${OWNER_NUMBER}
║ 🤖 Plataforma: Baileys
║ 📌 Prefijo: ${PREFIX}
║ ⚡ Node.js + TypeScript
╚══════════════════╝`;
    await sock.sendMessage(from, { text }, { quoted: msg as never });
  },
};

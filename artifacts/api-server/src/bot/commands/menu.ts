import type { Command } from "./types.js";
import { PREFIX, BOT_NAME } from "../config.js";
import { allCommands } from "./index.js";

export const menu: Command = {
  name: "menu",
  description: "Muestra todos los comandos disponibles",
  usage: "menu",
  async execute({ sock, from, msg, isOwner, isAdmin }) {
    const basic: Command[] = [];
    const admin: Command[] = [];
    const owner: Command[] = [];

    for (const cmd of allCommands.values()) {
      if (cmd.ownerOnly) owner.push(cmd);
      else if (cmd.adminOnly) admin.push(cmd);
      else basic.push(cmd);
    }

    const fmt = (list: Command[]) =>
      list
        .map((c) => `  ${PREFIX}${c.name.padEnd(12)} — ${c.description}`)
        .join("\n");

    let text = `╔══════════════════╗\n║   *${BOT_NAME}* 🤖\n╚══════════════════╝\n\n`;
    text += `📋 *Comandos básicos*\n${fmt(basic)}\n`;

    if (isAdmin || isOwner) {
      text += `\n👑 *Comandos de admin*\n${fmt(admin)}\n`;
    }

    if (isOwner && owner.length) {
      text += `\n🔐 *Comandos de owner*\n${fmt(owner)}\n`;
    }

    text += `\n_Prefijo actual: *${PREFIX}*_`;

    await sock.sendMessage(from, { text }, { quoted: msg as never });
  },
};

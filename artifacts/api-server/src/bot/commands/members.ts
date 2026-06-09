import type { Command } from "./types.js";

export const members: Command = {
  name: "members",
  description: "Lista los miembros del grupo",
  usage: "members",
  groupOnly: true,
  async execute({ sock, from, msg }) {
    const meta = await sock.groupMetadata(from);
    const total = meta.participants.length;
    const admins = meta.participants.filter((p) => p.admin != null).length;
    const regular = total - admins;
    const text = `👥 *Miembros de ${meta.subject}*\n\n` +
      `Total: ${total}\n` +
      `👮 Admins: ${admins}\n` +
      `👤 Miembros: ${regular}`;
    await sock.sendMessage(from, { text }, { quoted: msg as never });
  },
};

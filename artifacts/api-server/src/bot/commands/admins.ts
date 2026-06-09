import type { Command } from "./types.js";

export const admins: Command = {
  name: "admins",
  description: "Lista los administradores del grupo",
  usage: "admins",
  groupOnly: true,
  async execute({ sock, from, msg }) {
    const meta = await sock.groupMetadata(from);
    const adminList = meta.participants.filter((p) => p.admin != null);
    if (!adminList.length) {
      await sock.sendMessage(from, { text: "⚠️ No se encontraron admins." });
      return;
    }
    const mentions = adminList.map((p) => p.id);
    const lines = adminList
      .map((p, i) => `${i + 1}. @${p.id.split("@")[0]} ${p.admin === "superadmin" ? "👑" : "⭐"}`)
      .join("\n");
    await sock.sendMessage(
      from,
      { text: `👮 *Administradores (${adminList.length}):*\n\n${lines}`, mentions },
      { quoted: msg as never },
    );
  },
};

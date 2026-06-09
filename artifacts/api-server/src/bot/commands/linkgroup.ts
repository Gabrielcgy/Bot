import type { Command } from "./types.js";

export const linkgroup: Command = {
  name: "linkgroup",
  description: "Obtiene el link de invitación del grupo",
  usage: "linkgroup",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, msg }) {
    const code = await sock.groupInviteCode(from);
    await sock.sendMessage(
      from,
      { text: `🔗 *Link del grupo:*\nhttps://chat.whatsapp.com/${code}` },
      { quoted: msg as never },
    );
  },
};

import type { Command } from "./types.js";

export const deleteMsg: Command = {
  name: "delete",
  description: "Elimina el mensaje citado",
  usage: "delete (responder un mensaje)",
  adminOnly: true,
  async execute({ sock, from, msg }) {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    if (!ctx?.stanzaId) {
      await sock.sendMessage(from, {
        text: "❌ Debes responder al mensaje que quieres eliminar.",
      });
      return;
    }
    await sock.sendMessage(from, {
      delete: {
        remoteJid: from,
        id: ctx.stanzaId,
        participant: ctx.participant ?? undefined,
        fromMe: false,
      },
    });
  },
};

import type { Command } from "./types.js";

export const deleteMsg: Command = {
  name: "delete",
  description: "Elimina el mensaje citado",
  usage: "delete (responder un mensaje)",
  adminOnly: true,
  async execute({ sock, from, msg }) {
    const ctx =
      msg.message?.extendedTextMessage?.contextInfo ??
      msg.message?.imageMessage?.contextInfo ??
      msg.message?.videoMessage?.contextInfo ??
      msg.message?.audioMessage?.contextInfo ??
      msg.message?.documentMessage?.contextInfo ??
      msg.message?.stickerMessage?.contextInfo;

    if (!ctx?.stanzaId) {
      await sock.sendMessage(from, {
        text: "❌ Debes responder al mensaje que quieres eliminar.",
      });
      return;
    }

    try {
      await sock.sendMessage(from, {
        delete: {
          remoteJid: from,
          id: ctx.stanzaId,
          participant: ctx.participant ?? undefined,
          fromMe: ctx.participant == null, // si no hay participant es un mensaje propio
        },
      });
    } catch {
      await sock.sendMessage(from, {
        text: "⚠️ No se pudo eliminar el mensaje.",
      });
    }
  },
};

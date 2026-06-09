import type { Command } from "./types.js";

export const broadcast: Command = {
  name: "broadcast",
  description: "Envía un mensaje a todos los grupos",
  usage: "broadcast <mensaje>",
  ownerOnly: true,
  async execute({ sock, from, args, body }) {
    const text = body.slice(body.indexOf(" ") + 1).trim();
    if (!text || !args.length) {
      await sock.sendMessage(from, {
        text: "❌ Escribe el mensaje. Ej: .broadcast Hola a todos!",
      });
      return;
    }

    const groups = await sock.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);

    await sock.sendMessage(from, {
      text: `📢 Enviando a ${groupIds.length} grupos...`,
    });

    let sent = 0;
    let failed = 0;
    for (const gid of groupIds) {
      try {
        await sock.sendMessage(gid, {
          text: `📢 *Mensaje del Owner:*\n\n${text}`,
        });
        sent++;
        await new Promise((r) => setTimeout(r, 500));
      } catch {
        failed++;
      }
    }

    await sock.sendMessage(from, {
      text: `✅ Broadcast completado:\n✔ Enviado: ${sent}\n✘ Fallido: ${failed}`,
    });
  },
};

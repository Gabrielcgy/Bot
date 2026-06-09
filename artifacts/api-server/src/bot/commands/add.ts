import type { Command } from "./types.js";
import { phoneToJid } from "../utils/index.js";

export const add: Command = {
  name: "add",
  description: "Agrega un número al grupo",
  usage: "add 595xxxxxxxx",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, args, msg }) {
    const number = args[0];
    if (!number) {
      await sock.sendMessage(from, {
        text: "❌ Escribe el número a agregar. Ej: .add 595981234567",
      });
      return;
    }
    const jid = phoneToJid(number);
    const result = await sock.groupParticipantsUpdate(from, [jid], "add");
    const status = result?.[0]?.status;
    if (status === "200") {
      await sock.sendMessage(from, { text: `✅ +${number} agregado al grupo.` });
    } else {
      await sock.sendMessage(from, {
        text: `❌ No se pudo agregar +${number}. Código: ${status}`,
      });
    }
  },
};

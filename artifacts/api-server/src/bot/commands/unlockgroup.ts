import type { Command } from "./types.js";

export const unlockgroup: Command = {
  name: "unlockgroup",
  description: "Todos los miembros pueden enviar mensajes",
  usage: "unlockgroup",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from }) {
    await sock.groupSettingUpdate(from, "not_announcement");
    await sock.sendMessage(from, {
      text: "🔓 Grupo desbloqueado — todos pueden escribir.",
    });
  },
};

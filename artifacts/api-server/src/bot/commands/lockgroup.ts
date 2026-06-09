import type { Command } from "./types.js";

export const lockgroup: Command = {
  name: "lockgroup",
  description: "Solo admins pueden enviar mensajes",
  usage: "lockgroup",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from }) {
    await sock.groupSettingUpdate(from, "announcement");
    await sock.sendMessage(from, {
      text: "🔒 Grupo bloqueado — solo admins pueden escribir.",
    });
  },
};

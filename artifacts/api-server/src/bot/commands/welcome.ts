import type { Command } from "./types.js";
import { setGroupSettings, getGroupSettings } from "../state.js";

export const welcome: Command = {
  name: "welcome",
  description: "Activa o desactiva el mensaje de bienvenida",
  usage: "welcome on/off",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, args }) {
    const opt = args[0]?.toLowerCase();
    if (opt !== "on" && opt !== "off") {
      const current = getGroupSettings(from).welcomeEnabled;
      await sock.sendMessage(from, {
        text: `ℹ️ Bienvenida está *${current ? "ON ✅" : "OFF ❌"}*\nUsa: .welcome on/off`,
      });
      return;
    }
    const enabled = opt === "on";
    setGroupSettings(from, { welcomeEnabled: enabled });
    await sock.sendMessage(from, {
      text: `👋 Bienvenida *${enabled ? "activada ✅" : "desactivada ❌"}*`,
    });
  },
};

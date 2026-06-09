import type { Command } from "./types.js";
import { setGroupSettings, getGroupSettings } from "../state.js";

export const goodbye: Command = {
  name: "goodbye",
  description: "Activa o desactiva el mensaje de despedida",
  usage: "goodbye on/off",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, args }) {
    const opt = args[0]?.toLowerCase();
    if (opt !== "on" && opt !== "off") {
      const current = getGroupSettings(from).goodbyeEnabled;
      await sock.sendMessage(from, {
        text: `ℹ️ Despedida está *${current ? "ON ✅" : "OFF ❌"}*\nUsa: .goodbye on/off`,
      });
      return;
    }
    const enabled = opt === "on";
    setGroupSettings(from, { goodbyeEnabled: enabled });
    await sock.sendMessage(from, {
      text: `👋 Despedida *${enabled ? "activada ✅" : "desactivada ❌"}*`,
    });
  },
};

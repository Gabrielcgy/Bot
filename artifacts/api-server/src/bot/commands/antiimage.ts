import type { Command } from "./types.js";
import { setGroupSettings, getGroupSettings } from "../state.js";

export const antiimage: Command = {
  name: "antiimage",
  description: "Bloquea imágenes en el grupo",
  usage: "antiimage on/off",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, args }) {
    const opt = args[0]?.toLowerCase();
    if (opt !== "on" && opt !== "off") {
      const current = getGroupSettings(from).antiimageEnabled;
      await sock.sendMessage(from, {
        text: `ℹ️ Anti-imagen está *${current ? "ON ✅" : "OFF ❌"}*\nUsa: .antiimage on/off`,
      });
      return;
    }
    const enabled = opt === "on";
    setGroupSettings(from, { antiimageEnabled: enabled });
    await sock.sendMessage(from, {
      text: `🖼️ Anti-imagen *${enabled ? "activado ✅" : "desactivado ❌"}*`,
    });
  },
};

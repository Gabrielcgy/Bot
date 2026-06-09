import type { Command } from "./types.js";
import { setGroupSettings, getGroupSettings } from "../state.js";

export const antisticker: Command = {
  name: "antisticker",
  description: "Bloquea stickers en el grupo",
  usage: "antisticker on/off",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, args }) {
    const opt = args[0]?.toLowerCase();
    if (opt !== "on" && opt !== "off") {
      const current = getGroupSettings(from).antistickerEnabled;
      await sock.sendMessage(from, {
        text: `ℹ️ Anti-sticker está *${current ? "ON ✅" : "OFF ❌"}*\nUsa: .antisticker on/off`,
      });
      return;
    }
    const enabled = opt === "on";
    setGroupSettings(from, { antistickerEnabled: enabled });
    await sock.sendMessage(from, {
      text: `🚫 Anti-sticker *${enabled ? "activado ✅" : "desactivado ❌"}*`,
    });
  },
};

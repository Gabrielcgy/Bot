import type { Command } from "./types.js";
import { setGroupSettings, getGroupSettings } from "../state.js";

export const antivideo: Command = {
  name: "antivideo",
  description: "Bloquea videos en el grupo",
  usage: "antivideo on/off",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, args }) {
    const opt = args[0]?.toLowerCase();
    if (opt !== "on" && opt !== "off") {
      const current = getGroupSettings(from).antivideoEnabled;
      await sock.sendMessage(from, {
        text: `ℹ️ Anti-video está *${current ? "ON ✅" : "OFF ❌"}*\nUsa: .antivideo on/off`,
      });
      return;
    }
    const enabled = opt === "on";
    setGroupSettings(from, { antivideoEnabled: enabled });
    await sock.sendMessage(from, {
      text: `🎬 Anti-video *${enabled ? "activado ✅" : "desactivado ❌"}*`,
    });
  },
};

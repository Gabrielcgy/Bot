import type { Command } from "./types.js";
import { setGroupSettings, getGroupSettings } from "../state.js";

export const antispam: Command = {
  name: "antispam",
  description: "Activa o desactiva el anti-spam",
  usage: "antispam on/off",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, args }) {
    const opt = args[0]?.toLowerCase();
    if (opt !== "on" && opt !== "off") {
      const current = getGroupSettings(from).antispamEnabled;
      await sock.sendMessage(from, {
        text: `ℹ️ Anti-spam está *${current ? "ON ✅" : "OFF ❌"}*\nUsa: .antispam on/off`,
      });
      return;
    }
    const enabled = opt === "on";
    setGroupSettings(from, { antispamEnabled: enabled });
    await sock.sendMessage(from, {
      text: `🚫 Anti-spam *${enabled ? "activado ✅" : "desactivado ❌"}*`,
    });
  },
};

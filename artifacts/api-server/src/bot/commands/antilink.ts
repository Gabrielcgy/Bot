import type { Command } from "./types.js";
import { setGroupSettings, getGroupSettings } from "../state.js";

export const antilink: Command = {
  name: "antilink",
  description: "Activa o desactiva el anti-link",
  usage: "antilink on/off",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, args }) {
    const opt = args[0]?.toLowerCase();
    if (opt !== "on" && opt !== "off") {
      const current = getGroupSettings(from).antilinkEnabled;
      await sock.sendMessage(from, {
        text: `ℹ️ Anti-link está *${current ? "ON ✅" : "OFF ❌"}*\nUsa: .antilink on/off`,
      });
      return;
    }
    const enabled = opt === "on";
    setGroupSettings(from, { antilinkEnabled: enabled });
    await sock.sendMessage(from, {
      text: `🚫 Anti-link *${enabled ? "activado ✅" : "desactivado ❌"}*`,
    });
  },
};

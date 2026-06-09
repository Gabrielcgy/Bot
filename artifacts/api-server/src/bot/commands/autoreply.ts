import type { Command } from "./types.js";
import { setGroupSettings, getGroupSettings } from "../state.js";

export const autoreply: Command = {
  name: "autoreply",
  description: "Activa o desactiva el auto respuesta",
  usage: "autoreply on/off",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, args }) {
    const opt = args[0]?.toLowerCase();
    if (opt !== "on" && opt !== "off") {
      const current = getGroupSettings(from).autoreplyEnabled;
      await sock.sendMessage(from, {
        text: `ℹ️ Auto-reply está *${current ? "ON ✅" : "OFF ❌"}*\nUsa: .autoreply on/off`,
      });
      return;
    }
    const enabled = opt === "on";
    setGroupSettings(from, { autoreplyEnabled: enabled });
    await sock.sendMessage(from, {
      text: `💬 Auto-reply *${enabled ? "activado ✅" : "desactivado ❌"}*`,
    });
  },
};

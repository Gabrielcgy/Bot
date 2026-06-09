import type { Command } from "./types.js";
import { setGroupSettings, getGroupSettings } from "../state.js";

export const antimedia: Command = {
  name: "antimedia",
  description: "Bloquea todo tipo de medios en el grupo",
  usage: "antimedia on/off",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, args }) {
    const opt = args[0]?.toLowerCase();
    if (opt !== "on" && opt !== "off") {
      const current = getGroupSettings(from).antimediaEnabled;
      await sock.sendMessage(from, {
        text: `ℹ️ Anti-media está *${current ? "ON ✅" : "OFF ❌"}*\nUsa: .antimedia on/off`,
      });
      return;
    }
    const enabled = opt === "on";
    setGroupSettings(from, { antimediaEnabled: enabled });
    await sock.sendMessage(from, {
      text: `📵 Anti-media *${enabled ? "activado ✅" : "desactivado ❌"}*`,
    });
  },
};

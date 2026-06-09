import type { Command } from "./types.js";
import { setGroupSettings } from "../state.js";

export const mute: Command = {
  name: "mute",
  description: "Silencia el bot en este grupo",
  usage: "mute",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from }) {
    setGroupSettings(from, { muted: true });
    await sock.sendMessage(from, {
      text: "🔇 Bot silenciado. No responderé mensajes en este grupo.\nUsa *.unmute* para reactivarme.",
    });
  },
};

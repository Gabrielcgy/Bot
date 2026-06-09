import type { Command } from "./types.js";
import { setGroupSettings } from "../state.js";

export const unmute: Command = {
  name: "unmute",
  description: "Reactiva el bot en este grupo",
  usage: "unmute",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from }) {
    setGroupSettings(from, { muted: false });
    await sock.sendMessage(from, {
      text: "🔊 ¡Bot reactivado! Estoy escuchando de nuevo.",
    });
  },
};

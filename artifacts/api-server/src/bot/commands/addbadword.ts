import type { Command } from "./types.js";
import { globalBadWords, saveState } from "../state.js";

export const addbadword: Command = {
  name: "addbadword",
  description: "Agrega una palabra al diccionario global de groserías",
  usage: "addbadword palabra",
  adminOnly: true,
  async execute({ sock, from, args }) {
    const word = args[0]?.toLowerCase().trim();
    if (!word) {
      await sock.sendMessage(from, {
        text: "❌ Debes indicar la palabra.\n\nEjemplo: .addbadword put1",
      });
      return;
    }
    if (globalBadWords.has(word)) {
      await sock.sendMessage(from, {
        text: `⚠️ La palabra *${word}* ya está en el diccionario.`,
      });
      return;
    }
    globalBadWords.add(word);
    saveState();
    await sock.sendMessage(from, {
      text: `✅ *Palabra agregada correctamente.*\n\n📝 Nueva palabra: *${word}*\n🌎 Disponible globalmente en todos los grupos.`,
    });
  },
};

import type { Command } from "./types.js";
import { globalBadWords, saveState } from "../state.js";

export const delbadword: Command = {
  name: "delbadword",
  description: "Elimina una palabra del diccionario de groserías",
  usage: "delbadword palabra",
  adminOnly: true,
  async execute({ sock, from, args }) {
    const word = args[0]?.toLowerCase().trim();
    if (!word) {
      await sock.sendMessage(from, {
        text: "❌ Debes indicar la palabra.\n\nEjemplo: .delbadword put1",
      });
      return;
    }
    if (!globalBadWords.has(word)) {
      await sock.sendMessage(from, {
        text: `⚠️ La palabra *${word}* no está en el diccionario.`,
      });
      return;
    }
    globalBadWords.delete(word);
    saveState();
    await sock.sendMessage(from, {
      text: `✅ *Palabra eliminada correctamente.*\n\n🗑️ Palabra removida: *${word}*`,
    });
  },
};

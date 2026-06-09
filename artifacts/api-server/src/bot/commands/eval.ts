import type { Command } from "./types.js";

export const evalCmd: Command = {
  name: "eval",
  description: "Ejecuta código JavaScript (solo owner)",
  usage: "eval <código>",
  ownerOnly: true,
  async execute({ sock, from, body }) {
    const code = body.slice(body.indexOf(" ") + 1).trim();
    if (!code) {
      await sock.sendMessage(from, { text: "❌ Escribe el código a ejecutar." });
      return;
    }
    try {
      // eslint-disable-next-line no-eval
      let result = eval(code);
      if (result instanceof Promise) result = await result;
      const output = typeof result === "object"
        ? JSON.stringify(result, null, 2)
        : String(result);
      await sock.sendMessage(from, {
        text: `✅ *Resultado:*\n\`\`\`\n${output.slice(0, 2000)}\n\`\`\``,
      });
    } catch (err) {
      await sock.sendMessage(from, {
        text: `❌ *Error:*\n\`\`\`\n${String(err).slice(0, 1000)}\n\`\`\``,
      });
    }
  },
};

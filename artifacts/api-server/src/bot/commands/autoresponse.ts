import type { Command } from "./types.js";
import { getGroupSettings, globalAutoResponses } from "../state.js";

export const autoresponse: Command = {
  name: "autoresponse",
  description: "Agrega o elimina respuestas automáticas",
  usage: "autoresponse add texto => respuesta | autoresponse del texto",
  adminOnly: true,
  async execute({ sock, from, args, body, isGroup }) {
    const responses = isGroup
      ? getGroupSettings(from).autoResponses
      : globalAutoResponses;

    const sub = args[0]?.toLowerCase();

    if (sub === "add") {
      const rest = body.slice(body.indexOf("add") + 3).trim();
      const sep = rest.indexOf("=>");
      if (sep === -1) {
        await sock.sendMessage(from, {
          text: '❌ Formato: .autoresponse add <texto> => <respuesta>',
        });
        return;
      }
      const trigger = rest.slice(0, sep).trim().toLowerCase();
      const reply = rest.slice(sep + 2).trim();
      if (!trigger || !reply) {
        await sock.sendMessage(from, {
          text: '❌ El texto y la respuesta no pueden estar vacíos.',
        });
        return;
      }
      responses.set(trigger, reply);
      await sock.sendMessage(from, {
        text: `✅ Auto-respuesta añadida:\n*${trigger}* => _${reply}_`,
      });
      return;
    }

    if (sub === "del" || sub === "delete") {
      const trigger = args.slice(1).join(" ").toLowerCase();
      if (!trigger) {
        await sock.sendMessage(from, {
          text: '❌ Escribe el texto a eliminar. Ej: .autoresponse del hola',
        });
        return;
      }
      if (responses.has(trigger)) {
        responses.delete(trigger);
        await sock.sendMessage(from, {
          text: `🗑️ Auto-respuesta *${trigger}* eliminada.`,
        });
      } else {
        await sock.sendMessage(from, {
          text: `❌ No existe auto-respuesta para *${trigger}*`,
        });
      }
      return;
    }

    if (sub === "list") {
      if (!responses.size) {
        await sock.sendMessage(from, {
          text: "📋 No hay auto-respuestas configuradas.",
        });
        return;
      }
      const list = [...responses.entries()]
        .map(([k, v]) => `• *${k}* => _${v}_`)
        .join("\n");
      await sock.sendMessage(from, {
        text: `📋 *Auto-respuestas (${responses.size}):*\n\n${list}`,
      });
      return;
    }

    await sock.sendMessage(from, {
      text: `📋 *Uso del comando:*\n.autoresponse add <texto> => <respuesta>\n.autoresponse del <texto>\n.autoresponse list`,
    });
  },
};

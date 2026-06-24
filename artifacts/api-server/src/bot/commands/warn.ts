import type { Command } from "./types.js";
import { getGroupSettings, saveState } from "../state.js";
import { getMentioned, normalizeJid } from "../utils/index.js";
import { sleep } from "../utils/antiflood.js";

const MAX_WARNS = 7;

export const warn: Command = {
  name: "warn",
  description: "Advierte a un usuario (7 avisos = expulsión)",
  usage: "warn @usuario motivo",
  adminOnly: true,
  groupOnly: true,
  async execute({ sock, from, msg, isOwner, sender, args }) {
    const mentioned = getMentioned(msg).map(normalizeJid);
    if (!mentioned.length) {
      await sock.sendMessage(from, {
        text: "❌ Debes mencionar un usuario.\n\nEjemplo: .warn @usuario Spam",
      });
      return;
    }

    const settings = getGroupSettings(from);
    const motivo = args.filter((a) => !a.startsWith("@")).join(" ") || "Sin motivo";

    for (const jid of mentioned) {
      if (jid === sender && !isOwner) {
        await sock.sendMessage(from, { text: "❌ No puedes advertirte a ti mismo." });
        continue;
      }

      const prev = settings.warnings.get(jid) ?? 0;
      const count = prev + 1;
      const reasons = settings.warnReasons.get(jid) ?? [];
      reasons.push(motivo);
      settings.warnReasons.set(jid, reasons);

      if (count >= MAX_WARNS) {
        // Primero avisar, luego expulsar, luego limpiar contadores
        await sock.sendMessage(from, {
          text: `🚫 *LÍMITE ALCANZADO*\n\n👤 Usuario: @${jid.split("@")[0]}\n👮 Administrador: @${sender.split("@")[0]}\n📊 Advertencias: *${MAX_WARNS}/${MAX_WARNS}*\n\n⛔ Usuario expulsado automáticamente.`,
          mentions: [jid, sender],
        });
        await sleep(600);
        try {
          await sock.groupParticipantsUpdate(from, [jid], "remove");
          settings.warnings.delete(jid);
          settings.warnReasons.delete(jid);
        } catch {
          await sock.sendMessage(from, {
            text: "⚠️ No se pudo expulsar al usuario. ¿El bot es administrador?",
          });
        }
      } else {
        settings.warnings.set(jid, count);
        await sock.sendMessage(from, {
          text: `⚠️ *ADVERTENCIA REGISTRADA*\n\n👤 Usuario: @${jid.split("@")[0]}\n👮 Administrador: @${sender.split("@")[0]}\n📌 Motivo: ${motivo}\n📊 Advertencias: *${count}/${MAX_WARNS}*`,
          mentions: [jid, sender],
        });
      }
      saveState();
    }
  },
};

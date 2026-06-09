import type { WASocket, proto } from "@whiskeysockets/baileys";
import { PREFIX, OWNER_JID } from "../config.js";
import { getBody, getSender, normalizeJid, LINK_REGEX } from "../utils/index.js";
import { allCommands } from "../commands/index.js";
import { getGroupSettings } from "../state.js";
import { logger } from "../../lib/logger.js";

const AUTO_REPLIES: Record<string, string> = {
  hola: "Hola 👋 soy el bot, ¿en qué puedo ayudarte?",
  "buenas tardes": "Buenas tardes 🌆 ¿cómo te puedo ayudar?",
  "buenos días": "Buenos días ☀️ ¿cómo te puedo ayudar?",
  "buenas noches": "Buenas noches 🌙 ¿cómo te puedo ayudar?",
};

export async function onMessage(
  sock: WASocket,
  messages: proto.IWebMessageInfo[],
): Promise<void> {
  for (const msg of messages) {
    const key = msg.key;
    if (!msg.message || !key || key.fromMe) continue;

    const from = key.remoteJid ?? "";
    if (!from) continue;

    const isGroup = from.endsWith("@g.us");
    const sender = normalizeJid(getSender(msg));
    const isOwner = sender === OWNER_JID;
    const body = getBody(msg).trim();
    const pushName = msg.pushName ?? "Usuario";

    try {
      let isAdmin = false;
      if (isGroup) {
        try {
          const meta = await sock.groupMetadata(from);
          isAdmin = meta.participants.some(
            (p) => normalizeJid(p.id) === sender && p.admin != null,
          );
        } catch {
          // ignore metadata errors
        }
      }

      // ── Anti-link ───────────────────────────────────────────────
      if (isGroup && LINK_REGEX.test(body)) {
        const settings = getGroupSettings(from);
        if (settings.antilinkEnabled && !isAdmin && !isOwner) {
          await sock.sendMessage(from, {
            text: `⚠️ @${sender.split("@")[0]} no está permitido enviar links en este grupo.`,
            mentions: [sender],
          });
          await sock.groupParticipantsUpdate(from, [sender], "remove");
          continue;
        }
      }

      // ── Comandos ────────────────────────────────────────────────
      if (body.startsWith(PREFIX)) {
        const [rawCmd, ...args] = body.slice(PREFIX.length).trim().split(/\s+/);
        const cmdName = rawCmd.toLowerCase();
        const cmd = allCommands.get(cmdName);

        if (!cmd) {
          await sock.sendMessage(
            from,
            { text: `❓ Comando desconocido: *${PREFIX}${cmdName}*\nUsa *${PREFIX}menu* para ver los comandos.` },
            { quoted: msg as never },
          );
          continue;
        }

        if (cmd.groupOnly && !isGroup) {
          await sock.sendMessage(from, {
            text: "❌ Este comando solo funciona en grupos.",
          });
          continue;
        }

        if (cmd.adminOnly && !isAdmin && !isOwner) {
          await sock.sendMessage(
            from,
            { text: "❌ Solo los admins pueden usar este comando." },
            { quoted: msg as never },
          );
          continue;
        }

        if (cmd.ownerOnly && !isOwner) {
          await sock.sendMessage(
            from,
            { text: "❌ Solo el owner puede usar este comando." },
            { quoted: msg as never },
          );
          continue;
        }

        logger.info({ cmd: cmdName, sender, from }, "Comando ejecutado");
        await cmd.execute({ sock, msg, args, body, from, sender, isGroup, isOwner, isAdmin, pushName });
        continue;
      }

      // ── Auto respuesta ──────────────────────────────────────────
      const settings = isGroup ? getGroupSettings(from) : null;
      const autoreplyOn = settings ? settings.autoreplyEnabled : true;

      if (autoreplyOn) {
        const key = body.toLowerCase();
        for (const [trigger, reply] of Object.entries(AUTO_REPLIES)) {
          if (key.includes(trigger)) {
            await sock.sendMessage(from, { text: reply }, { quoted: msg as never });
            break;
          }
        }
      }
    } catch (err) {
      logger.error({ err, from, sender }, "Error procesando mensaje");
    }
  }
}

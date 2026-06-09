import type { WASocket, proto } from "@whiskeysockets/baileys";
import { getContentType } from "@whiskeysockets/baileys";
import { PREFIX, OWNER_JID } from "../config.js";
import { getBody, getSender, normalizeJid, LINK_REGEX } from "../utils/index.js";
import { allCommands } from "../commands/index.js";
import { getGroupSettings, globalAutoResponses } from "../state.js";
import { logger } from "../../lib/logger.js";

const SPAM_LIMIT = 5;
const SPAM_WINDOW_MS = 5000;

type MediaType = "imageMessage" | "videoMessage" | "stickerMessage" | "audioMessage" | "documentMessage";

function getMediaType(msg: proto.IWebMessageInfo): MediaType | null {
  const m = msg.message;
  if (!m) return null;
  const type = getContentType(m);
  if (
    type === "imageMessage" ||
    type === "videoMessage" ||
    type === "stickerMessage" ||
    type === "audioMessage" ||
    type === "documentMessage"
  ) {
    return type as MediaType;
  }
  return null;
}

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
      const settings = isGroup ? getGroupSettings(from) : null;

      if (isGroup && settings) {
        // ── Muted check ─────────────────────────────────────────
        if (settings.muted && !body.startsWith(PREFIX)) continue;

        try {
          const meta = await sock.groupMetadata(from);
          isAdmin = meta.participants.some(
            (p) => normalizeJid(p.id) === sender && p.admin != null,
          );
        } catch { /* ignore */ }

        // ── Anti-link ──────────────────────────────────────────
        if (settings.antilinkEnabled && !isAdmin && !isOwner && LINK_REGEX.test(body)) {
          await sock.sendMessage(from, {
            text: `⚠️ @${sender.split("@")[0]} los links no están permitidos.`,
            mentions: [sender],
          });
          await sock.groupParticipantsUpdate(from, [sender], "remove");
          continue;
        }

        // ── Anti-spam ──────────────────────────────────────────
        if (settings.antispamEnabled && !isAdmin && !isOwner) {
          const tracker = settings.spamTracker;
          const now = Date.now();
          const entry = tracker.get(sender) ?? { count: 0, lastTime: now };
          if (now - entry.lastTime < SPAM_WINDOW_MS) {
            entry.count++;
          } else {
            entry.count = 1;
            entry.lastTime = now;
          }
          tracker.set(sender, entry);
          if (entry.count >= SPAM_LIMIT) {
            entry.count = 0;
            await sock.sendMessage(from, {
              text: `🚫 @${sender.split("@")[0]} detectado como spam. Expulsado.`,
              mentions: [sender],
            });
            await sock.groupParticipantsUpdate(from, [sender], "remove");
            continue;
          }
        }

        // ── Anti-media checks ──────────────────────────────────
        if (!isAdmin && !isOwner) {
          const mediaType = getMediaType(msg);
          let blocked = false;

          if (mediaType) {
            if (settings.antimediaEnabled) blocked = true;
            else if (mediaType === "imageMessage" && settings.antiimageEnabled) blocked = true;
            else if (mediaType === "videoMessage" && settings.antivideoEnabled) blocked = true;
            else if (mediaType === "stickerMessage" && settings.antistickerEnabled) blocked = true;
          }

          if (blocked) {
            await sock.sendMessage(from, {
              delete: { remoteJid: from, id: key.id!, participant: key.participant ?? undefined, fromMe: false },
            });
            await sock.sendMessage(from, {
              text: `⚠️ @${sender.split("@")[0]} ese tipo de contenido no está permitido.`,
              mentions: [sender],
            });
            continue;
          }
        }
      }

      // ── Comandos ─────────────────────────────────────────────
      if (body.startsWith(PREFIX)) {
        const [rawCmd, ...args] = body.slice(PREFIX.length).trim().split(/\s+/);
        const cmdName = rawCmd.toLowerCase();
        const cmd = allCommands.get(cmdName);

        if (!cmd) {
          await sock.sendMessage(
            from,
            { text: `❓ Comando *${PREFIX}${cmdName}* no existe.\nUsa *${PREFIX}menu* para ver todos.` },
            { quoted: msg as never },
          );
          continue;
        }

        if (cmd.groupOnly && !isGroup) {
          await sock.sendMessage(from, { text: "❌ Solo funciona en grupos." });
          continue;
        }
        if (cmd.adminOnly && !isAdmin && !isOwner) {
          await sock.sendMessage(from, { text: "❌ Solo los admins pueden usar esto." }, { quoted: msg as never });
          continue;
        }
        if (cmd.ownerOnly && !isOwner) {
          await sock.sendMessage(from, { text: "❌ Solo el owner puede usar esto." }, { quoted: msg as never });
          continue;
        }

        logger.info({ cmd: cmdName, sender, from }, "Comando ejecutado");
        await cmd.execute({ sock, msg, args, body, from, sender, isGroup, isOwner, isAdmin, pushName });
        continue;
      }

      // ── Auto respuesta ────────────────────────────────────────
      const autoreplyOn = settings ? settings.autoreplyEnabled : true;
      if (!autoreplyOn) continue;

      const customResponses = settings?.autoResponses ?? new Map<string, string>();
      const lowerBody = body.toLowerCase();

      // Check group-specific responses first, then global
      let replied = false;
      for (const [trigger, reply] of customResponses) {
        if (lowerBody.includes(trigger)) {
          await sock.sendMessage(from, { text: reply }, { quoted: msg as never });
          replied = true;
          break;
        }
      }
      if (!replied) {
        for (const [trigger, reply] of globalAutoResponses) {
          if (lowerBody.includes(trigger)) {
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

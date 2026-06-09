import type { WASocket, GroupParticipant } from "@whiskeysockets/baileys";
import { getGroupSettings } from "../state.js";
import { normalizeJid } from "../utils/index.js";
import { logger } from "../../lib/logger.js";

interface GroupUpdateEvent {
  id: string;
  participants: GroupParticipant[];
  action: string;
}

function applyTemplate(template: string, user: string, group: string): string {
  return template
    .replace(/\{user\}/g, user)
    .replace(/\{group\}/g, group);
}

export async function onGroupUpdate(
  sock: WASocket,
  update: GroupUpdateEvent,
): Promise<void> {
  const { id: groupId, participants, action } = update;

  try {
    const settings = getGroupSettings(groupId);
    const meta = await sock.groupMetadata(groupId);
    const groupName = meta.subject;

    if (action === "add" && settings.welcomeEnabled) {
      for (const participant of participants) {
        const jid = normalizeJid(participant.id);
        const number = jid.split("@")[0];
        const text = applyTemplate(settings.welcomeText, number, groupName);

        await sock.sendMessage(groupId, {
          text,
          mentions: [jid],
        });
        logger.info({ groupId, participant: jid }, "Bienvenida enviada");
      }
    }

    if (action === "remove" && settings.goodbyeEnabled) {
      for (const participant of participants) {
        const jid = normalizeJid(participant.id);
        const number = jid.split("@")[0];
        const text = applyTemplate(settings.byeText, number, groupName);

        await sock.sendMessage(groupId, {
          text,
          mentions: [jid],
        });
        logger.info({ groupId, participant: jid }, "Despedida enviada");
      }
    }
  } catch (err) {
    logger.error({ err, groupId, action }, "Error en evento de grupo");
  }
}

import type { WASocket, GroupParticipant } from "@whiskeysockets/baileys";
import { getGroupSettings } from "../state.js";
import { normalizeJid } from "../utils/index.js";
import { logger } from "../../lib/logger.js";

interface GroupUpdateEvent {
  id: string;
  participants: GroupParticipant[];
  action: string;
}

export async function onGroupUpdate(
  sock: WASocket,
  update: GroupUpdateEvent,
): Promise<void> {
  const { id: groupId, participants, action } = update;

  try {
    const settings = getGroupSettings(groupId);

    if (action === "add" && settings.welcomeEnabled) {
      const meta = await sock.groupMetadata(groupId);
      const groupName = meta.subject;

      for (const participant of participants) {
        const jid = normalizeJid(participant.id);
        const number = jid.split("@")[0];

        await sock.sendMessage(groupId, {
          text:
            `👋 ¡Bienvenido/a al grupo *${groupName}*, @${number}! 🎉\n\n` +
            `Esperamos que disfrutes tu estadía. Recuerda leer las reglas del grupo.`,
          mentions: [jid],
        });

        logger.info({ groupId, participant: jid }, "Bienvenida enviada");
      }
    }

    if (action === "remove" && settings.welcomeEnabled) {
      for (const participant of participants) {
        const jid = normalizeJid(participant.id);
        const number = jid.split("@")[0];

        await sock.sendMessage(groupId, {
          text: `👋 @${number} ha salido del grupo. ¡Hasta pronto!`,
          mentions: [jid],
        });

        logger.info({ groupId, participant: jid }, "Despedida enviada");
      }
    }
  } catch (err) {
    logger.error({ err, groupId, action }, "Error en evento de grupo");
  }
}

import type { Command } from "./types.js";
import { PREFIX, BOT_NAME, OWNER_NAME, BOT_VERSION, BOT_START_TIME } from "../config.js";
import { allCommands } from "./index.js";
import { formatUptime } from "../utils/index.js";

export const menu: Command = {
  name: "menu",
  description: "Muestra todos los comandos disponibles",
  usage: "menu",
  async execute({ sock, from, msg, isOwner, isAdmin }) {
    const now = new Date();
    const fecha = now.toLocaleDateString("es-PY", { day: "2-digit", month: "2-digit", year: "numeric" });
    const hora = now.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" });
    const uptime = formatUptime(Date.now() - BOT_START_TIME);
    const totalCmds = allCommands.size;

    let text = `╔══════════════════════╗\n`;
    text += `║  🤖 *${BOT_NAME}*  ║\n`;
    text += `╚══════════════════════╝\n\n`;
    text += `👑 Owner: *${OWNER_NAME}*\n`;
    text += `📅 Fecha: *${fecha}*\n`;
    text += `🕐 Hora: *${hora}*\n`;
    text += `⏱️ Activo: *${uptime}*\n`;
    text += `📦 Versión: *v${BOT_VERSION}*\n`;
    text += `📋 Comandos: *${totalCmds}*\n`;
    text += `🟢 Estado: *Online*\n`;
    text += `\n━━━━━━━━━━━━━━━━━━━━\n`;

    text += `\n📋 *COMANDOS GENERALES*\n`;
    text += `  ${PREFIX}menu — Este menú\n`;
    text += `  ${PREFIX}ping — Verificar velocidad\n`;
    text += `  ${PREFIX}info — Info del bot\n`;
    text += `  ${PREFIX}status — Estado del bot\n`;

    if (isAdmin || isOwner) {
      text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      text += `\n👥 *GESTIÓN DE USUARIOS*\n`;
      text += `  ${PREFIX}kick @usuario — Expulsar\n`;
      text += `  ${PREFIX}ban @usuario motivo — Expulsar con motivo\n`;
      text += `  ${PREFIX}add número — Agregar\n`;
      text += `  ${PREFIX}promote @usuario — Promover admin\n`;
      text += `  ${PREFIX}demote @usuario — Quitar admin\n`;
      text += `  ${PREFIX}delete — Eliminar mensaje\n`;

      text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      text += `\n👮 *ADMINISTRACIÓN*\n`;
      text += `  ${PREFIX}groupinfo — Info del grupo\n`;
      text += `  ${PREFIX}admins — Ver admins\n`;
      text += `  ${PREFIX}members — Ver miembros\n`;
      text += `  ${PREFIX}linkgroup — Enlace del grupo\n`;
      text += `  ${PREFIX}lockgroup — Cerrar grupo\n`;
      text += `  ${PREFIX}unlockgroup — Abrir grupo\n`;

      text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      text += `\n🎉 *BIENVENIDAS Y DESPEDIDAS*\n`;
      text += `  ${PREFIX}welcome on/off\n`;
      text += `  ${PREFIX}goodbye on/off\n`;
      text += `  ${PREFIX}setwelcome texto\n`;
      text += `  ${PREFIX}setbye texto\n`;
      text += `  _Variables: {user} {group} {members}_\n`;

      text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      text += `\n🛡️ *SEGURIDAD*\n`;
      text += `  ${PREFIX}antilink on/off\n`;
      text += `  ${PREFIX}antispam on/off\n`;
      text += `  ${PREFIX}antimedia on/off\n`;
      text += `  ${PREFIX}antisticker on/off\n`;
      text += `  ${PREFIX}antiimage on/off\n`;
      text += `  ${PREFIX}antivideo on/off\n`;
      text += `  ${PREFIX}antigroserias on/off\n`;

      text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      text += `\n⚠️ *ADVERTENCIAS*\n`;
      text += `  ${PREFIX}warn @usuario motivo\n`;
      text += `  ${PREFIX}warns @usuario\n`;
      text += `  ${PREFIX}resetwarn @usuario\n`;

      text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      text += `\n🔒 *CONTROL DEL GRUPO*\n`;
      text += `  ${PREFIX}mute @usuario — Silenciar\n`;
      text += `  ${PREFIX}unmute @usuario — Dessilenciar\n`;

      text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      text += `\n⚡ *AUTO RESPUESTAS*\n`;
      text += `  ${PREFIX}autoreply on/off\n`;
      text += `  ${PREFIX}autoresponse add palabra => resp\n`;
      text += `  ${PREFIX}autoresponse del palabra\n`;

      text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      text += `\n🧠 *DICCIONARIO*\n`;
      text += `  ${PREFIX}addbadword palabra\n`;
      text += `  ${PREFIX}delbadword palabra\n`;
      text += `  ${PREFIX}badwords — Ver lista\n`;

      text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      text += `\n⚙️ *CONFIGURACIÓN*\n`;
      text += `  ${PREFIX}cleanmod on/off — Modo limpio\n`;
    }

    if (isOwner) {
      text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      text += `\n👑 *OWNER*\n`;
      text += `  ${PREFIX}shutdown — Apagar bot\n`;
      text += `  ${PREFIX}restart — Reiniciar bot\n`;
      text += `  ${PREFIX}broadcast mensaje — Difundir\n`;
      text += `  ${PREFIX}eval código — Ejecutar código\n`;
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    text += `\n_Prefijo: *${PREFIX}* | ${BOT_NAME} v${BOT_VERSION}_`;

    await sock.sendMessage(from, { text }, { quoted: msg as never });
  },
};

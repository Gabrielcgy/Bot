import type { Command } from "./types.js";

export const groupinfo: Command = {
  name: "groupinfo",
  description: "Información del grupo",
  usage: "groupinfo",
  groupOnly: true,
  async execute({ sock, from, msg }) {
    const meta = await sock.groupMetadata(from);
    const admins = meta.participants.filter((p) => p.admin != null).length;
    const created = meta.creation
      ? new Date(meta.creation * 1000).toLocaleDateString("es-PY")
      : "Desconocido";
    const text = `╔══════════════════╗
║  📋 *Info del Grupo*
╠══════════════════╣
║ 📌 Nombre: ${meta.subject}
║ 👥 Miembros: ${meta.participants.length}
║ 👮 Admins: ${admins}
║ 📅 Creado: ${created}
║ 📝 Desc: ${meta.desc ? meta.desc.slice(0, 80) : "Sin descripción"}
╚══════════════════╝`;
    await sock.sendMessage(from, { text }, { quoted: msg as never });
  },
};

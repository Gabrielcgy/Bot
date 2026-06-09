import type { Command } from "./types.js";
import { ping } from "./ping.js";
import { info } from "./info.js";
import { kick } from "./kick.js";
import { add } from "./add.js";
import { promote } from "./promote.js";
import { demote } from "./demote.js";
import { welcome } from "./welcome.js";
import { goodbye } from "./goodbye.js";
import { setwelcome } from "./setwelcome.js";
import { setbye } from "./setbye.js";
import { antilink } from "./antilink.js";
import { antispam } from "./antispam.js";
import { antimedia } from "./antimedia.js";
import { antisticker } from "./antisticker.js";
import { antiimage } from "./antiimage.js";
import { antivideo } from "./antivideo.js";
import { autoreply } from "./autoreply.js";
import { autoresponse } from "./autoresponse.js";
import { mute } from "./mute.js";
import { unmute } from "./unmute.js";
import { lockgroup } from "./lockgroup.js";
import { unlockgroup } from "./unlockgroup.js";
import { groupinfo } from "./groupinfo.js";
import { admins } from "./admins.js";
import { members } from "./members.js";
import { linkgroup } from "./linkgroup.js";
import { deleteMsg } from "./delete.js";
import { shutdown } from "./shutdown.js";
import { restart } from "./restart.js";
import { broadcast } from "./broadcast.js";
import { evalCmd } from "./eval.js";
import { menu } from "./menu.js";

export const allCommands = new Map<string, Command>([
  // Básicos
  ["menu", menu],
  ["ping", ping],
  ["info", info],
  // Admin
  ["kick", kick],
  ["add", add],
  ["promote", promote],
  ["demote", demote],
  ["delete", deleteMsg],
  // Grupo
  ["groupinfo", groupinfo],
  ["admins", admins],
  ["members", members],
  ["linkgroup", linkgroup],
  // Bienvenida
  ["welcome", welcome],
  ["setwelcome", setwelcome],
  ["goodbye", goodbye],
  ["setbye", setbye],
  // Seguridad
  ["antilink", antilink],
  ["antispam", antispam],
  ["antimedia", antimedia],
  ["antisticker", antisticker],
  ["antiimage", antiimage],
  ["antivideo", antivideo],
  // Control
  ["mute", mute],
  ["unmute", unmute],
  ["lockgroup", lockgroup],
  ["unlockgroup", unlockgroup],
  // Auto respuesta
  ["autoreply", autoreply],
  ["autoresponse", autoresponse],
  // Owner
  ["shutdown", shutdown],
  ["restart", restart],
  ["broadcast", broadcast],
  ["eval", evalCmd],
]);

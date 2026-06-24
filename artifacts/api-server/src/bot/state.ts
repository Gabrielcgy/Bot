import { registerStateRef, loadState, startAutosave, saveState } from "./persistence.js";
import { logger } from "../lib/logger.js";

interface GroupSettings {
  welcomeEnabled: boolean;
  welcomeText: string;
  goodbyeEnabled: boolean;
  byeText: string;
  antilinkEnabled: boolean;
  antispamEnabled: boolean;
  antimediaEnabled: boolean;
  antistickerEnabled: boolean;
  antiimageEnabled: boolean;
  antivideoEnabled: boolean;
  autoreplyEnabled: boolean;
  antigroserias: boolean;
  cleanmod: boolean;
  mutedUsers: Set<string>;
  locked: boolean;
  warnings: Map<string, number>;
  warnReasons: Map<string, string[]>;
  autoResponses: Map<string, string>;
  spamTracker: Map<string, { count: number; lastTime: number }>;
}

const defaults = (): GroupSettings => ({
  welcomeEnabled: true,
  welcomeText: "🎉 *¡BIENVENIDO/A AL GRUPO!*\n\n👤 Usuario: @{user}\n🏠 Grupo: *{group}*\n👥 Miembros: *{members}*\n\n_¡Esperamos que disfrutes tu estadía!_ 😊",
  goodbyeEnabled: true,
  byeText: "👋 *HASTA PRONTO*\n\n👤 Usuario: @{user}\n🏠 Grupo: *{group}*\n👥 Miembros: *{members}*\n\n_¡Buena suerte!_ 🍀",
  antilinkEnabled: false,
  antispamEnabled: false,
  antimediaEnabled: false,
  antistickerEnabled: false,
  antiimageEnabled: false,
  antivideoEnabled: false,
  autoreplyEnabled: true,
  antigroserias: false,
  cleanmod: true,
  mutedUsers: new Set<string>(),
  locked: false,
  warnings: new Map<string, number>(),
  warnReasons: new Map<string, string[]>(),
  autoResponses: new Map(),
  spamTracker: new Map(),
});

export const globalBadWords = new Set<string>([
  "puta", "puto", "mierda", "coño", "joder", "hostia", "cabron", "cabrona",
  "hdp", "imbecil", "idiota", "estupido", "estupida", "gilipollas",
  "maricon", "maricona", "pendejo", "pendeja", "culero", "culera",
  "chinga", "chingada", "chingado", "verga", "polla", "culo",
  "concha", "pelotudo", "pelotuda", "boludo", "boluda", "forro",
  "hdlp", "ctm", "stm", "csm", "ptm", "reconcha",
  "sorete", "carajo", "hijoputa", "malparido", "malparida",
  "pito", "pija", "chota", "pajero", "pajera",
]);

const groupSettings = new Map<string, GroupSettings>();

// ── Restaurar desde disco ─────────────────────────────────────────────────
(function initFromDisk() {
  registerStateRef({ groupSettings, globalBadWords });
  const saved = loadState();
  if (!saved) {
    logger.info("[INFO] Estado inicial en memoria (sin guardado previo)");
    startAutosave();
    return;
  }
  for (const [jid, g] of Object.entries(saved.groups)) {
    const gs = defaults();
    gs.welcomeEnabled = g.welcomeEnabled ?? gs.welcomeEnabled;
    gs.welcomeText = g.welcomeText ?? gs.welcomeText;
    gs.goodbyeEnabled = g.goodbyeEnabled ?? gs.goodbyeEnabled;
    gs.byeText = g.byeText ?? gs.byeText;
    gs.antilinkEnabled = g.antilinkEnabled ?? gs.antilinkEnabled;
    gs.antispamEnabled = g.antispamEnabled ?? gs.antispamEnabled;
    gs.antimediaEnabled = g.antimediaEnabled ?? gs.antimediaEnabled;
    gs.antistickerEnabled = g.antistickerEnabled ?? gs.antistickerEnabled;
    gs.antiimageEnabled = g.antiimageEnabled ?? gs.antiimageEnabled;
    gs.antivideoEnabled = g.antivideoEnabled ?? gs.antivideoEnabled;
    gs.autoreplyEnabled = g.autoreplyEnabled ?? gs.autoreplyEnabled;
    gs.antigroserias = g.antigroserias ?? gs.antigroserias;
    gs.cleanmod = g.cleanmod ?? gs.cleanmod;
    gs.locked = g.locked ?? gs.locked;
    gs.mutedUsers = new Set(g.mutedUsers ?? []);
    gs.warnings = new Map(g.warnings ?? []);
    gs.warnReasons = new Map(g.warnReasons ?? []);
    gs.autoResponses = new Map(g.autoResponses ?? []);
    groupSettings.set(jid, gs);
  }
  for (const word of saved.globalBadWords ?? []) {
    globalBadWords.add(word);
  }
  logger.info(
    { groups: Object.keys(saved.groups).length },
    `[OK] Estado restaurado desde disco (guardado: ${saved.savedAt})`,
  );
  startAutosave();
})();

// ── Limpiar spamTracker cada hora (anti memory leak) ─────────────────────
setInterval(() => {
  const now = Date.now();
  for (const gs of groupSettings.values()) {
    for (const [jid, entry] of gs.spamTracker) {
      if (now - entry.lastTime > 60_000) gs.spamTracker.delete(jid);
    }
  }
}, 60 * 60 * 1000).unref();

// ── Exports ───────────────────────────────────────────────────────────────

export function getGroupSettings(jid: string): GroupSettings {
  if (!groupSettings.has(jid)) {
    groupSettings.set(jid, defaults());
  }
  return groupSettings.get(jid)!;
}

export function setGroupSettings(jid: string, patch: Partial<GroupSettings>): void {
  const current = getGroupSettings(jid);
  groupSettings.set(jid, { ...current, ...patch });
  saveState();
}

const globalAutoResponses = new Map<string, string>([
  ["hola", "Hola 👋 soy *KILLERCG*, ¿en qué puedo ayudarte?"],
  ["buenas tardes", "Buenas tardes 🌆 ¿cómo te puedo ayudar?"],
  ["buenos días", "Buenos días ☀️ ¿cómo te puedo ayudar?"],
  ["buenas noches", "Buenas noches 🌙 ¿cómo te puedo ayudar?"],
]);

export { globalAutoResponses };
export { saveState };

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
  muted: boolean;
  locked: boolean;
  autoResponses: Map<string, string>;
  spamTracker: Map<string, { count: number; lastTime: number }>;
}

const defaults = (): GroupSettings => ({
  welcomeEnabled: true,
  welcomeText: "👋 ¡Bienvenido/a al grupo *{group}*, @{user}! 🎉\nEsperamos que disfrutes tu estadía.",
  goodbyeEnabled: true,
  byeText: "👋 @{user} ha salido del grupo. ¡Hasta pronto!",
  antilinkEnabled: false,
  antispamEnabled: false,
  antimediaEnabled: false,
  antistickerEnabled: false,
  antiimageEnabled: false,
  antivideoEnabled: false,
  autoreplyEnabled: true,
  muted: false,
  locked: false,
  autoResponses: new Map(),
  spamTracker: new Map(),
});

const groupSettings = new Map<string, GroupSettings>();

export function getGroupSettings(jid: string): GroupSettings {
  if (!groupSettings.has(jid)) {
    groupSettings.set(jid, defaults());
  }
  return groupSettings.get(jid)!;
}

export function setGroupSettings(jid: string, patch: Partial<GroupSettings>): void {
  const current = getGroupSettings(jid);
  groupSettings.set(jid, { ...current, ...patch });
}

const globalAutoResponses = new Map<string, string>([
  ["hola", "Hola 👋 soy el bot, ¿en qué puedo ayudarte?"],
  ["buenas tardes", "Buenas tardes 🌆 ¿cómo te puedo ayudar?"],
  ["buenos días", "Buenos días ☀️ ¿cómo te puedo ayudar?"],
  ["buenas noches", "Buenas noches 🌙 ¿cómo te puedo ayudar?"],
]);

export { globalAutoResponses };

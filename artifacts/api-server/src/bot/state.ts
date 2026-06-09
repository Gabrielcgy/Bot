interface GroupSettings {
  welcomeEnabled: boolean;
  antilinkEnabled: boolean;
  autoreplyEnabled: boolean;
}

const defaults: GroupSettings = {
  welcomeEnabled: true,
  antilinkEnabled: false,
  autoreplyEnabled: true,
};

const groupSettings = new Map<string, GroupSettings>();

export function getGroupSettings(jid: string): GroupSettings {
  if (!groupSettings.has(jid)) {
    groupSettings.set(jid, { ...defaults });
  }
  return groupSettings.get(jid)!;
}

export function setGroupSettings(
  jid: string,
  patch: Partial<GroupSettings>,
): void {
  const current = getGroupSettings(jid);
  groupSettings.set(jid, { ...current, ...patch });
}

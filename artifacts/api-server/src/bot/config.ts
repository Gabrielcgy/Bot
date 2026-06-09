export const PREFIX = process.env["BOT_PREFIX"] ?? ".";
export const OWNER_NUMBER = (
  process.env["WA_OWNER"] ?? process.env["WA_PHONE_NUMBER"] ?? ""
).replace(/\D/g, "");
export const BOT_NAME = process.env["BOT_NAME"] ?? "WhatsApp Bot";
export const OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`;

export const config = {
  botName: process.env["BOT_NAME"] ?? "Mi Bot",
  ownerName: process.env["OWNER_NAME"] ?? "César",
  ownerNumber: process.env["WA_OWNER"] ?? process.env["WA_PHONE_NUMBER"] ?? "595973282151",
  prefix: process.env["BOT_PREFIX"] ?? ".",
};

export const PREFIX = config.prefix;
export const OWNER_NUMBER = config.ownerNumber.replace(/\D/g, "");
export const BOT_NAME = config.botName;
export const OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`;

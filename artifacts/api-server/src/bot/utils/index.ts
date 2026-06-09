import type { proto } from "@whiskeysockets/baileys";
import { getContentType } from "@whiskeysockets/baileys";
import { OWNER_JID } from "../config.js";

export function getBody(msg: proto.IWebMessageInfo): string {
  const m = msg.message;
  if (!m) return "";
  const type = getContentType(m);
  if (!type) return "";
  switch (type) {
    case "conversation":
      return m.conversation ?? "";
    case "extendedTextMessage":
      return m.extendedTextMessage?.text ?? "";
    case "imageMessage":
      return m.imageMessage?.caption ?? "";
    case "videoMessage":
      return m.videoMessage?.caption ?? "";
    case "buttonsResponseMessage":
      return m.buttonsResponseMessage?.selectedDisplayText ?? "";
    case "listResponseMessage":
      return m.listResponseMessage?.title ?? "";
    default:
      return "";
  }
}

export function getSender(msg: proto.IWebMessageInfo): string {
  const key = msg.key;
  if (!key) return "";
  return key.fromMe
    ? OWNER_JID
    : (key.participant ?? key.remoteJid ?? "");
}

export function getMentioned(msg: proto.IWebMessageInfo): string[] {
  return (
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid ??
    msg.message?.imageMessage?.contextInfo?.mentionedJid ??
    []
  );
}

export function normalizeJid(jid: string): string {
  return jid.includes(":") ? jid.split(":")[0] + "@s.whatsapp.net" : jid;
}

export function phoneToJid(phone: string): string {
  return phone.replace(/\D/g, "") + "@s.whatsapp.net";
}

export const LINK_REGEX = /chat\.whatsapp\.com\/[a-zA-Z0-9]+/i;

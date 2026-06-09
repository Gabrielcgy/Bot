import type { WASocket, proto } from "@whiskeysockets/baileys";

export interface CommandContext {
  sock: WASocket;
  msg: proto.IWebMessageInfo;
  args: string[];
  body: string;
  from: string;
  sender: string;
  isGroup: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  pushName: string;
}

export interface Command {
  name: string;
  description: string;
  usage: string;
  adminOnly?: boolean;
  ownerOnly?: boolean;
  groupOnly?: boolean;
  execute: (ctx: CommandContext) => Promise<void>;
}

import type { Command } from "./types.js";
import { ping } from "./ping.js";
import { info } from "./info.js";
import { kick } from "./kick.js";
import { add } from "./add.js";
import { promote } from "./promote.js";
import { demote } from "./demote.js";
import { welcome } from "./welcome.js";
import { antilink } from "./antilink.js";
import { autoreply } from "./autoreply.js";
import { menu } from "./menu.js";

export const allCommands = new Map<string, Command>([
  ["menu", menu],
  ["ping", ping],
  ["info", info],
  ["kick", kick],
  ["add", add],
  ["promote", promote],
  ["demote", demote],
  ["welcome", welcome],
  ["antilink", antilink],
  ["autoreply", autoreply],
]);

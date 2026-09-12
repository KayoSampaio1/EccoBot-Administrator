require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");

const dataDir = path.join(process.cwd(), "data");
const configFile = path.join(dataDir, "config.json");

const defaults = {
  warningLimit: 3,
  muteMinutes: 10,
  antiLink: true,
  antiSpam: true,
  autoMod: true,
  antiBot: false,
  antiSuspicious: true,
  suspiciousAccountDays: 3,
  logChannelId: process.env.LOG_CHANNEL_ID || "",
  reportChannelId: process.env.REPORT_CHANNEL_ID || "",
  reportCategoryId: process.env.REPORT_CATEGORY_ID || "",
  protectedRoleIds: [],
  whitelistChannelIds: [],
  whitelistRoleIds: [],
  badWords: ["palavrao1", "palavrao2", "palavrao3"],
  antiSpamMaxMessages: 6,
  antiSpamWindowMs: 5000,
  antiRaidJoins: 8,
  antiRaidWindowMs: 10000
};

function loadFile() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(configFile)) fs.writeFileSync(configFile, JSON.stringify(defaults, null, 2));
  try { return { ...defaults, ...JSON.parse(fs.readFileSync(configFile, "utf8")) }; }
  catch { return { ...defaults }; }
}
function saveFile(value) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(configFile, JSON.stringify(value, null, 2));
}
const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  adminRoleId: process.env.ADMIN_ROLE_ID || "1548394825009864734",
  botName: process.env.BOT_NAME || "Ecco Admin",
  ...loadFile()
};
config.save = () => saveFile({ ...config, save: undefined, token: undefined, clientId: undefined, guildId: undefined, adminRoleId: config.adminRoleId, botName: config.botName });
config.reload = () => Object.assign(config, loadFile());
module.exports = config;

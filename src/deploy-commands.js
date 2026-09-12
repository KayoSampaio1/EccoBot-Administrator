const {REST,Routes}=require("discord.js");
const config=require("./config");
const commands=require("./commands");
if(!config.token||!config.clientId||!config.guildId){console.error("Preencha DISCORD_TOKEN, CLIENT_ID e GUILD_ID no .env");process.exit(1);}
const rest=new REST({version:"10"}).setToken(config.token);
(async()=>{await rest.put(Routes.applicationGuildCommands(config.clientId,config.guildId),{body:commands});console.log(`Ecco Admin: ${commands.length} comandos registrados.`);})().catch(console.error);

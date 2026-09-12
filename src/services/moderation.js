const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../config");
const store = require("./store");

async function log(guild,title,description,extra={}){
  if(!config.logChannelId)return;
  const c=await guild.channels.fetch(config.logChannelId).catch(()=>null);
  if(!c?.isTextBased())return;
  const e=new EmbedBuilder().setTitle(title).setDescription(description).setTimestamp();
  if(extra.color)e.setColor(extra.color);
  if(extra.fields)e.addFields(extra.fields);
  if(extra.footer)e.setFooter({text:extra.footer});
  if(extra.files)await c.send({embeds:[e],files:extra.files}).catch(()=>{}); else await c.send({embeds:[e]}).catch(()=>{});
}
function isAdmin(member){return !!member && (member.permissions?.has(PermissionFlagsBits.Administrator)||member.roles?.cache?.has(config.adminRoleId));}
function isProtected(member){return member?.roles?.cache?.some(r=>config.protectedRoleIds.includes(r.id));}
function isWhitelisted(message){return config.whitelistChannelIds.includes(message.channel.id)||message.member?.roles?.cache?.some(r=>config.whitelistRoleIds.includes(r.id));}
async function warn(member,message,reason){
  const limit=store.get(member.guild.id,member.id).limit??config.warningLimit;
  const r=store.addWarning(member.guild.id,member.id,message.id,limit);
  if(r.duplicate)return r;
  const n=r.count;
  await message.delete().catch(()=>{});
  if(n>=limit){
    await member.timeout(config.muteMinutes*60000,reason).catch(()=>{});
    await message.channel.send({content:`${member}, você atingiu o limite de advertências **(${n}/${limit})**. Você recebeu **mute de ${config.muteMinutes} minutos**.`}).catch(()=>{});
    await log(member.guild,"🔇 Punição automática",`${member.user.tag} recebeu mute automático.\n**Motivo:** ${reason}\n**Advertências:** ${n}/${limit}`);
  } else {
    await message.channel.send({content:`${member}, esse tipo de conteúdo não é permitido. Advertência **(${n}/${limit})**. Ao chegar em ${limit}, você receberá **mute de ${config.muteMinutes} minutos**.`}).catch(()=>{});
    await log(member.guild,"⚠️ Advertência",`${member.user.tag}\n**Motivo:** ${reason}\n**Advertências:** ${n}/${limit}`);
  }
  return r;
}
module.exports={log,isAdmin,isProtected,isWhitelisted,warn};

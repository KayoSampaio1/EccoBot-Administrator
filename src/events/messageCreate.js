const config=require("../config");
const {isAdmin,isProtected,isWhitelisted,warn}=require("../services/moderation");
const {hasProfanity,hasLink}=require("../services/filters");
const spam=new Map();
module.exports=async function(message){
 if(!message.guild||message.author.bot||!message.member)return;
 if(isAdmin(message.member)||isProtected(message.member)||isWhitelisted(message))return;
 if(config.autoMod && hasProfanity(message.content,config.badWords))return warn(message.member,message,"xingamento/conteúdo ofensivo");
 if(config.antiLink && hasLink(message.content))return warn(message.member,message,"link não permitido");
 if(config.antiSpam){
  const key=`${message.guild.id}:${message.author.id}`;const now=Date.now();const arr=(spam.get(key)||[]).filter(t=>now-t<config.antiSpamWindowMs);arr.push(now);spam.set(key,arr);
  if(arr.length>=config.antiSpamMaxMessages)return warn(message.member,message,"spam de mensagens");
 }
};

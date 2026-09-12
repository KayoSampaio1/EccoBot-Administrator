const config=require("../config");
const {log}=require("../services/moderation");
const joins=new Map();
module.exports=async function(member){
 const now=Date.now(),a=(joins.get(member.guild.id)||[]).filter(t=>now-t<config.antiRaidWindowMs);a.push(now);joins.set(member.guild.id,a);
 if(a.length>=config.antiRaidJoins)await log(member.guild,"🚨 Anti-raid acionado",`Foram detectadas **${a.length} entradas** em ${config.antiRaidWindowMs/1000}s.`);
 if(member.user.bot){
  await log(member.guild,"🤖 Bot entrou no servidor",`${member.user.tag} entrou como bot. Anti-bot: **${config.antiBot?"ATIVO":"apenas registro"}**.`);
  if(config.antiBot)await member.kick("Ecco Admin: bot não autorizado").catch(()=>{});
  return;
 }
 const ageDays=(Date.now()-member.user.createdTimestamp)/86400000;
 if(config.antiSuspicious && ageDays<config.suspiciousAccountDays){
  await member.timeout(config.muteMinutes*60000,"Ecco Admin: conta suspeita/recente").catch(()=>{});
  await log(member.guild,"🕵️ Conta suspeita",`${member.user.tag} tem aproximadamente **${ageDays.toFixed(1)} dia(s)** de conta e recebeu timeout preventivo.`);
 }
};

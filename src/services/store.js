const fs = require("node:fs");
const path = require("node:path");
const dir = path.join(process.cwd(), "data");
const file = path.join(dir, "warnings.json");
function load(){fs.mkdirSync(dir,{recursive:true});if(!fs.existsSync(file))fs.writeFileSync(file,"{}");try{return JSON.parse(fs.readFileSync(file,"utf8"));}catch{return {};}}
function save(d){fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(file,JSON.stringify(d,null,2));}
function get(guildId,userId){const d=load();return d[guildId]?.[userId]||{count:0,processed:[],limit:null};}
function set(guildId,userId,value){const d=load();d[guildId]??={};d[guildId][userId]=value;save(d);}
function addWarning(guildId,userId,messageId,limit){const x=get(guildId,userId);if(x.processed.includes(messageId))return {duplicate:true,...x};x.count++;x.processed.push(messageId);x.processed=x.processed.slice(-10000);set(guildId,userId,x);return {...x,limit:x.limit??limit};}
function reset(guildId,userId,count=0){const x=get(guildId,userId);set(guildId,userId,{...x,count});}
function setLimit(guildId,userId,limit){const x=get(guildId,userId);set(guildId,userId,{...x,limit});return limit;}
module.exports={get,addWarning,reset,setLimit};

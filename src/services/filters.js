const URL_RE = /(?:https?:\/\/|www\.)\S+/i;
function normalize(text){return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^\p{L}\p{N}\s]/gu," ");}
function hasLink(text){return URL_RE.test(text);}
function hasProfanity(text,badWords=[]){const normalized=normalize(text);return badWords.some(w=>{const word=normalize(w).trim();return word && new RegExp(`(^|\\s)${word.replace(/[.*+?^${}()|[\\]\\]/g,"\\$&")}(?=\\s|$)`,"i").test(normalized);});}
module.exports={hasLink,hasProfanity};

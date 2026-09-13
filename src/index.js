const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

const config=require("./config");
const {isAdmin,isProtected,isWhitelisted,warn,log}=require("./services/moderation");
const store=require("./services/store");
const filters=require("./services/filters");
const visuals=require("../visuals.bot");
const messageCreate=require("./events/messageCreate");
const memberAdd=require("./events/guildMemberAdd");

const client=new Client({
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials:[Partials.Channel]
});

const adminOnly=new Set([
  "ma",
  "ban",
  "kick",
  "mute",
  "unmute",
  "warn",
  "warnings",
  "clear",
  "removeallmsg",
  "lock",
  "unlock",
  "slowmode",
  "antilink",
  "antispam",
  "automod",
  "logs",
  "set",
  "panel",
  "verifc"
]);

const color=0x5865F2;

function visualReply(i, contentOrOptions, image){
  if(typeof contentOrOptions==="string"){
    const text=contentOrOptions;
    const selected=image ||
      (text.includes("❌") || text.includes("⛔") ? visuals.denied :
       text.includes("⚠️") ? visuals.admin.warning :
       text.includes("🔨") ? visuals.admin.ban :
       text.includes("👢") ? visuals.admin.kick :
       text.includes("🔇") ? visuals.admin.mute :
       text.includes("🛡️") ? visuals.admin.protection :
       text.includes("🧹") ? visuals.settings :
       visuals.success);
    const embed=new EmbedBuilder().setDescription(text).setColor(
      text.includes("❌") || text.includes("⛔") ? 0xED4245 :
      text.includes("⚠️") ? 0xFEE75C : 0x57F287
    );
    if(selected) embed.setImage(selected);
    return visualReply(i, {embeds:[embed]});
  }
  const options={...contentOrOptions};
  const text=options.content || "";
  const selected=image ||
    (text.includes("❌") || text.includes("⛔") ? visuals.denied :
     text.includes("⚠️") ? visuals.admin.warning :
     visuals.success);
  if(text){
    delete options.content;
    const embed=new EmbedBuilder().setDescription(text).setColor(
      text.includes("❌") || text.includes("⛔") ? 0xED4245 :
      text.includes("⚠️") ? 0xFEE75C : 0x57F287
    );
    if(selected) embed.setImage(selected);
    options.embeds=[embed, ...(options.embeds || [])];
  }
  return visualReply(i, options);
}

function save(){
  config.save();
}

function mention(u){
  return `<@${u.id}>`;
}

function toggleField(name,value){
  return `**${name}:** ${value?"🟢 ATIVO":"🔴 DESATIVADO"}`;
}

client.once("ready",c=>{
  console.log(`Ecco Admin online como ${c.user.tag}`);
});

client.on("messageCreate",messageCreate);
client.on("guildMemberAdd",memberAdd);


// =====================================================
// PROVAS DE REPORT
// =====================================================

client.on("messageCreate",async message=>{
  if(
    !message.guild ||
    message.author.bot ||
    !message.attachments.size ||
    !config.reportChannelId
  ) return;

  const reportChannel=
    message.channel.parentId &&
    message.channel.name.startsWith("report-");

  if(!reportChannel) return;

  const dest=
    await message.guild.channels
      .fetch(config.reportChannelId)
      .catch(()=>null);

  if(!dest?.isTextBased()) return;

  await dest.send({
    content:
      `🚨 **Nova prova de report**\n`+
      `Ticket: ${message.channel}\n`+
      `Enviada por: ${message.author}\n`+
      `${message.attachments.map(a=>a.url).join("\n")}`,
    files:message.attachments.map(a=>a.url)
  }).catch(()=>{});

  await message.channel
    .send("✅ Prova recebida e encaminhada para a Administração/ADM+.")
    .catch(()=>{});
});


// =====================================================
// INTERAÇÕES
// =====================================================

client.on("interactionCreate",async i=>{

  try{

    // =================================================
    // BOTÕES DO PAINEL
    // =================================================

    if(i.isButton()){

      if(!isAdmin(i.member)){
        return visualReply(i, {
          content:"⛔ Apenas Admin+ pode usar o painel.",
          ephemeral:true
        });
      }

      if(!i.customId.startsWith("ecco_toggle:")) return;

      const key=i.customId.split(":")[1];

      config[key]=!config[key];

      save();

      return i.update({
        content:
          `${toggleField(key,config[key])}\n`+
          `Configuração atualizada.`,
        embeds:[],
        components:[]
      });
    }


    // =================================================
    // SLASH COMMANDS
    // =================================================

    if(!i.isChatInputCommand()) return;

    if(
      adminOnly.has(i.commandName) &&
      !isAdmin(i.member)
    ){
      return visualReply(i, {
        content:"⛔ Apenas **Admin+** pode usar este comando.",
        ephemeral:true
      });
    }

    const guild=i.guild;


    // =================================================
    // CONFIG
    // =================================================

    if(i.commandName==="config"){
      return visualReply(i, {
        content:"Use **/panel** para abrir a configuração do Ecco Admin.",
        ephemeral:true
      });
    }


    // =================================================
    // PANEL
    // =================================================

    if(i.commandName==="panel"){

      const bullyingWords=
        Array.isArray(config.bullyingWords)
          ? config.bullyingWords
          : [];

      const e=new EmbedBuilder()
        .setColor(color)
        .setTitle("⚙️ Ecco Admin — Painel de Configuração")
        .setDescription([
          toggleField("Anti-link",config.antiLink),
          toggleField("Anti-spam",config.antiSpam),
          toggleField("AutoMod",config.autoMod),
          toggleField("Anti-bot",config.antiBot),
          toggleField("Anti-conta suspeita",config.antiSuspicious),
          `**Limite de advertências:** ${config.warningLimit}`,
          `**Mute automático:** ${config.muteMinutes} min`,
          `**Expressões de bullying:** ${bullyingWords.length}`,
          `**Canal de logs:** ${
            config.logChannelId
              ? `<#${config.logChannelId}>`
              : "não configurado"
          }`
        ].join("\n"));

      const row=new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("ecco_toggle:antiLink")
            .setLabel("Anti-link")
            .setStyle(ButtonStyle.Secondary),

          new ButtonBuilder()
            .setCustomId("ecco_toggle:antiSpam")
            .setLabel("Anti-spam")
            .setStyle(ButtonStyle.Secondary),

          new ButtonBuilder()
            .setCustomId("ecco_toggle:autoMod")
            .setLabel("AutoMod")
            .setStyle(ButtonStyle.Primary),

          new ButtonBuilder()
            .setCustomId("ecco_toggle:antiBot")
            .setLabel("Anti-bot")
            .setStyle(ButtonStyle.Danger)
        );

      return visualReply(i, {
        embeds:[e],
        components:[row]
      });
    }


    // =================================================
    // VERIFC
    // =================================================

    if(i.commandName==="verifc"){

      const msgs=
        await i.channel.messages.fetch({limit:100});

      let n=0;

      for(const msg of msgs.values()){

        if(
          msg.author.bot ||
          !msg.member ||
          isAdmin(msg.member) ||
          isProtected(msg.member) ||
          isWhitelisted(msg)
        ) continue;

        let reason=null;

        if(
          config.autoMod &&
          filters.hasProfanity(
            msg.content,
            config.bullyingWords
          )
        ){
          reason="bullying/ofensa direcionada";
        }

        else if(
          config.antiLink &&
          filters.hasLink(msg.content)
        ){
          reason="link não permitido";
        }

        if(reason){

          const r=await warn(
            msg.member,
            msg,
            `${reason} detectado pelo /verifc`
          );

          if(!r.duplicate){
            n++;
          }
        }
      }

      return visualReply(i, 
        `🔎 Verificação concluída. **${n} ocorrência(s) nova(s)** processada(s).`
      );
    }


    // =================================================
    // BAN / KICK
    // =================================================

    if(
      i.commandName==="ban" ||
      i.commandName==="kick"
    ){

      const u=i.options.getUser("usuario");

      const m=
        await guild.members
          .fetch(u.id)
          .catch(()=>null);

      const reason=
        i.options.getString("motivo") ||
        "Sem motivo informado";

      if(!m){
        return visualReply(i, {
          content:"❌ Usuário não está no servidor.",
          ephemeral:true
        });
      }

      if(
        m.id===i.user.id ||
        m.id===client.user.id ||
        isProtected(m)
      ){
        return visualReply(i, {
          content:"❌ Esse usuário está protegido ou não pode ser punido.",
          ephemeral:true
        });
      }

      if(
        m.roles.highest.position>=i.member.roles.highest.position &&
        !i.member.permissions.has(
          PermissionFlagsBits.Administrator
        )
      ){
        return visualReply(i, {
          content:"❌ A hierarquia de cargos impede essa ação.",
          ephemeral:true
        });
      }

      if(i.commandName==="ban"){
        await m.ban({reason});
      }else{
        await m.kick(reason);
      }

      await log(
        guild,
        i.commandName==="ban"
          ? "🔨 Banimento"
          : "👢 Expulsão",
        `**Usuário:** ${u.tag}\n`+
        `**Punido por:** ${i.user.tag}\n`+
        `**Motivo:** ${reason}`
      );

      return visualReply(i, 
        `✅ ${u} foi ${
          i.commandName==="ban"
            ? "banido"
            : "expulso"
        }.`
      );
    }


    // =================================================
    // MUTE / UNMUTE
    // =================================================

    if(
      i.commandName==="mute" ||
      i.commandName==="unmute"
    ){

      const m=
        await guild.members
          .fetch(
            i.options.getUser("usuario").id
          )
          .catch(()=>null);

      if(!m){
        return visualReply(i, {
          content:"❌ Usuário não encontrado.",
          ephemeral:true
        });
      }

      if(isProtected(m)){
        return visualReply(i, {
          content:"❌ Esse usuário está protegido.",
          ephemeral:true
        });
      }

      if(i.commandName==="mute"){

        const mins=
          i.options.getInteger("minutos");

        const reason=
          i.options.getString("motivo") ||
          "Mute manual";

        await m.timeout(
          mins*60000,
          reason
        );

        await log(
          guild,
          "🔇 Mute manual",
          `**Usuário:** ${m.user.tag}\n`+
          `**Punido por:** ${i.user.tag}\n`+
          `**Duração:** ${mins} min\n`+
          `**Motivo:** ${reason}`
        );

        return visualReply(i, 
          `✅ ${m} recebeu mute por **${mins} minutos**.`
        );
      }

      await m.timeout(
        null,
        `Unmute por ${i.user.tag}`
      );

      await log(
        guild,
        "🔊 Unmute",
        `**Usuário:** ${m.user.tag}\n`+
        `**Executado por:** ${i.user.tag}`
      );

      return visualReply(i, 
        `✅ Mute removido de ${m}.`
      );
    }


    // =================================================
    // WARN
    // =================================================

    if(i.commandName==="warn"){

      const m=
        await guild.members
          .fetch(
            i.options.getUser("usuario").id
          )
          .catch(()=>null);

      const reason=
        i.options.getString("motivo");

      if(!m){
        return visualReply(i, {
          content:"❌ Usuário não encontrado.",
          ephemeral:true
        });
      }

      if(isProtected(m)){
        return visualReply(i, {
          content:"❌ Esse usuário está protegido.",
          ephemeral:true
        });
      }

      const fake={
        id:`manual-${Date.now()}`,
        delete:async()=>{}
      };

      const r=store.addWarning(
        guild.id,
        m.id,
        fake.id,
        store.get(guild.id,m.id).limit ??
        config.warningLimit
      );

      const limit=
        r.limit ??
        config.warningLimit;

      if(r.count>=limit){

        await m.timeout(
          config.muteMinutes*60000,
          reason
        );

        await log(
          guild,
          "🔇 Punição por advertências",
          `**Usuário:** ${m.user.tag}\n`+
          `**Punido por:** ${i.user.tag}\n`+
          `**Motivo:** ${reason}\n`+
          `**Advertências:** ${r.count}/${limit}`
        );

        return visualReply(i, 
          `⚠️ ${m} recebeu advertência **(${r.count}/${limit})** e atingiu o limite. `+
          `Mute de **${config.muteMinutes} min** aplicado.`
        );
      }

      await log(
        guild,
        "⚠️ Advertência manual",
        `**Usuário:** ${m.user.tag}\n`+
        `**Punido por:** ${i.user.tag}\n`+
        `**Motivo:** ${reason}\n`+
        `**Advertências:** ${r.count}/${limit}`
      );

      return visualReply(i, 
        `⚠️ ${m} recebeu advertência **(${r.count}/${limit})**.`
      );
    }


    // =================================================
    // WARNINGS
    // =================================================

    if(i.commandName==="warnings"){

      const m=
        i.options.getUser("usuario");

      const x=
        store.get(guild.id,m.id);

      const limit=
        x.limit ??
        config.warningLimit;

      return visualReply(i, {
        content:
          `⚠️ **Advertências de ${m.tag}:** ${x.count}/${limit}\n`+
          `${
            x.limit
              ? `Limite individual: ${x.limit}`
              : "Limite global: "+config.warningLimit
          }`,
        ephemeral:true
      });
    }


    // =================================================
    // CLEAR
    // =================================================

    if(i.commandName==="clear"){

      const n=
        i.options.getInteger("quantidade");

      const deleted=
        await i.channel.bulkDelete(
          n,
          true
        );

      await log(
        guild,
        "🧹 Mensagens apagadas",
        `**Canal:** ${i.channel}\n`+
        `**Quantidade:** ${deleted.size}\n`+
        `**Executado por:** ${i.user.tag}`
      );

      return visualReply(i, {
        content:
          `🧹 ${deleted.size} mensagem(ns) apagada(s).`,
        ephemeral:true
      });
    }


    // =================================================
    // REMOVE ALL MSG
    // =================================================

    if(i.commandName==="removeallmsg"){

      const target=
        config.reportChannelId
          ? await guild.channels
              .fetch(config.reportChannelId)
              .catch(()=>null)
          : null;

      const channel=
        target?.isTextBased()
          ? target
          : i.channel;

      if(
        channel.id!==i.channel.id &&
        i.channel.id!==config.logChannelId
      ){
        return visualReply(i, {
          content:
            `❌ Use este comando no canal específico configurado. `+
            `Canal alvo atual: ${channel}.`,
          ephemeral:true
        });
      }

      let total=0;

      for(let n=0;n<10;n++){

        const msgs=
          await channel.messages.fetch({
            limit:100
          });

        if(!msgs.size) break;

        const del=
          await channel
            .bulkDelete(msgs,true)
            .catch(()=>null);

        if(!del?.size) break;

        total+=del.size;

        if(msgs.size<100) break;
      }

      return visualReply(i, {
        content:
          `🧹 Foram removidas aproximadamente **${total} mensagens** de ${channel}.`,
        ephemeral:true
      });
    }


    // =================================================
    // LOCK / UNLOCK
    // =================================================

    if(
      ["lock","unlock"].includes(i.commandName)
    ){

      const everyone=
        guild.roles.everyone;

      await i.channel.permissionOverwrites.edit(
        everyone,
        {
          SendMessages:
            i.commandName==="unlock"
              ? null
              : false
        }
      );

      await log(
        guild,
        i.commandName==="lock"
          ? "🔒 Canal bloqueado"
          : "🔓 Canal desbloqueado",
        `**Canal:** ${i.channel}\n`+
        `**Executado por:** ${i.user.tag}`
      );

      return visualReply(i, 
        `✅ ${
          i.commandName==="lock"
            ? "Canal bloqueado"
            : "Canal desbloqueado"
        }.`
      );
    }


    // =================================================
    // SLOWMODE
    // =================================================

    if(i.commandName==="slowmode"){

      const s=
        i.options.getInteger("segundos");

      await i.channel.setRateLimitPerUser(s);

      return visualReply(i, 
        `🐢 Slowmode definido para **${s}s**.`
      );
    }


    // =================================================
    // ANTI-LINK / ANTI-SPAM / AUTOMOD
    // =================================================

    if(
      ["antilink","antispam","automod"]
        .includes(i.commandName)
    ){

      const key={
        antilink:"antiLink",
        antispam:"antiSpam",
        automod:"autoMod"
      }[i.commandName];

      config[key]=
        i.options.getSubcommand()==="on";

      save();

      return visualReply(i, 
        `✅ **${key}**: ${
          config[key]
            ? "ATIVO"
            : "DESATIVADO"
        }.`
      );
    }


    // =================================================
    // LOGS
    // =================================================

    if(
      i.commandName==="logs" &&
      i.options.getSubcommand()==="configurar"
    ){

      config.logChannelId=
        i.channel.id;

      save();

      return visualReply(i, 
        `✅ Este canal agora é o canal de **logs**.`
      );
    }


    // =================================================
    // SET
    // =================================================

    if(i.commandName==="set"){

      const sub=
        i.options.getSubcommand();


      // MODO DE TESTE
      if(sub==="modo-teste"){

        const acao=
          i.options.getString("acao");

        config.testMode=
          acao==="on";

        save();

        return visualReply(i, 
          `🧪 **Modo de teste:** ${
            config.testMode
              ? "🟢 ATIVADO"
              : "🔴 DESATIVADO"
          }`
        );
      }


      // CARGO
      if(sub==="cargo"){

        const m=
          await guild.members.fetch(
            i.options.getUser("usuario").id
          );

        const r=
          i.options.getRole("cargo");

        const a=
          i.options.getString("acao") ||
          "add";

        if(
          r.managed ||
          r.position>=guild.members.me.roles.highest.position
        ){
          return visualReply(i, {
            content:
              "❌ Não consigo gerenciar esse cargo por causa da hierarquia.",
            ephemeral:true
          });
        }

        if(a==="remove"){
          await m.roles.remove(r);
        }else{
          await m.roles.add(r);
        }

        await log(
          guild,
          "🎭 Cargo alterado",
          `**Usuário:** ${m.user.tag}\n`+
          `**Cargo:** ${r.name}\n`+
          `**Ação:** ${a}\n`+
          `**Executado por:** ${i.user.tag}`
        );

        return visualReply(i, 
          `✅ Cargo **${r.name}** ${
            a==="remove"
              ? "removido de"
              : "adicionado a"
          } ${m}.`
        );
      }


      // CANAL DE LOGS
      if(sub==="canal-logs"){

        const canal=
          i.options.getChannel("canal");

        config.logChannelId=
          canal.id;

        save();

        return visualReply(i, 
          `✅ Canal de logs definido para ${canal}.`
        );
      }


      // CANAL DE REPORTS
      if(sub==="canal-reports"){

        const canal=
          i.options.getChannel("canal");

        config.reportChannelId=
          canal.id;

        save();

        return visualReply(i, 
          `✅ Canal que receberá provas de reports definido para ${canal}.`
        );
      }


      // LISTAS
      const listMap={
        "cargo-protegido":"protectedRoleIds",
        "whitelist-canal":"whitelistChannelIds",
        "whitelist-cargo":"whitelistRoleIds"
      };

      if(listMap[sub]){

        const list=
          config[listMap[sub]];

        const obj=
          i.options.getRole("cargo") ||
          i.options.getChannel("canal");

        const a=
          i.options.getString("acao") ||
          "add";

        if(
          a==="add" &&
          !list.includes(obj.id)
        ){
          list.push(obj.id);
        }

        if(a==="remove"){
          config[listMap[sub]]=
            list.filter(
              x=>x!==obj.id
            );
        }

        save();

        return visualReply(i, 
          `✅ Configuração de **${obj.name}** atualizada.`
        );
      }


      // PALAVRA / BULLYING
      if(sub==="palavra"){

        const p=
          i.options
            .getString("palavra")
            .toLowerCase()
            .trim();

        const a=
          i.options.getString("acao") ||
          "add";

        if(
          !Array.isArray(
            config.bullyingWords
          )
        ){
          config.bullyingWords=[];
        }

        if(
          a==="add" &&
          !config.bullyingWords.includes(p)
        ){
          config.bullyingWords.push(p);
        }

        if(a==="remove"){

          config.bullyingWords=
            config.bullyingWords.filter(
              x=>x!==p
            );
        }

        save();

        return visualReply(i, 
          `✅ Expressão de bullying **${p}** ${
            a==="add"
              ? "adicionada ao filtro"
              : "removida do filtro"
          }.`
        );
      }
    }


    // =================================================
    // /MA
    // =================================================

    if(i.commandName==="ma"){

      const sub=
        i.options.getSubcommand();


      // =================================================
      // 📢 AVISO
      // =================================================

      if(sub==="aviso"){

        const mensagem=
          i.options.getString("mensagem");

        const embed=
          new EmbedBuilder()
            .setColor(color)
            .setTitle("📢 | ECCO — COMUNICADO")
            .setDescription(mensagem)
            .setFooter({
              text:`Ecco • Publicado por ${i.user.tag}`
            })
            .setTimestamp();

        await i.channel.send({
          embeds:[embed]
        });

        return visualReply(i, {
          content:
            "✅ Aviso publicado com sucesso.",
          ephemeral:true
        });
      }


      // =================================================
      // COMANDOS QUE PRECISAM DE USUÁRIO
      // =================================================

      const usuario=
        i.options.getUser("usuario");

      const m=
        await guild.members
          .fetch(usuario.id)
          .catch(()=>null);

      if(!m){
        return visualReply(i, {
          content:"❌ Usuário não encontrado.",
          ephemeral:true
        });
      }

      if(isProtected(m)){
        return visualReply(i, {
          content:
            "❌ Esse usuário está protegido.",
          ephemeral:true
        });
      }


      // MUTE
      if(sub==="mute"){

        const mins=
          i.options.getInteger("minutos");

        const reason=
          i.options.getString("motivo") ||
          "/MA";

        const current=
          m.communicationDisabledUntilTimestamp &&
          m.communicationDisabledUntilTimestamp>Date.now()
            ? m.communicationDisabledUntilTimestamp-Date.now()
            : 0;

        await m.timeout(
          current+mins*60000,
          reason
        );

        await log(
          guild,
          "🛠️ /MA — Mute ampliado",
          `**Usuário:** ${m.user.tag}\n`+
          `**Admin:** ${i.user.tag}\n`+
          `**Adicional:** ${mins} min\n`+
          `**Motivo:** ${reason}`
        );

        return visualReply(i, 
          `✅ Adicionei **${mins} minutos** ao mute de ${m}.`
        );
      }


      // LIMITE
      if(sub==="limite"){

        const lim=
          i.options.getInteger("limite");

        store.setLimit(
          guild.id,
          m.id,
          lim
        );

        return visualReply(i, 
          `✅ O limite de advertências de ${m} agora é **${lim}**.`
        );
      }


      // DM
      if(sub==="dm"){

        const msg=
          i.options.getString("mensagem");

        try{

          await m.send(
            `📢 **Aviso da Administração — Ecco**\n\n${msg}`
          );

          return visualReply(i, 
            `✅ Aviso enviado no privado de ${m}.`
          );

        }catch{

          return visualReply(i, {
            content:
              "❌ Não foi possível enviar DM.",
            ephemeral:true
          });
        }
      }
    }


    // =================================================
    // REPORT
    // =================================================

    if(i.commandName==="report"){

      const u=
        i.options.getUser("usuario");

      const motivo=
        i.options.getString("motivo");

      const name=
        `report-${i.user.username}-${Date.now().toString().slice(-4)}`
          .slice(0,95);

      const overwrites=[
        {
          id:guild.roles.everyone.id,
          deny:[
            PermissionFlagsBits.ViewChannel
          ]
        },
        {
          id:i.user.id,
          allow:[
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.AttachFiles
          ]
        },
        {
          id:config.adminRoleId,
          allow:[
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.AttachFiles
          ]
        }
      ];

      const ch=
        await guild.channels.create({
          name,
          type:ChannelType.GuildText,
          parent:
            config.reportCategoryId ||
            undefined,
          permissionOverwrites:
            overwrites
        });

      await ch.send({
        content:
          `🚨 **Novo report**\n`+
          `**Denunciante:** ${i.user}\n`+
          `**Denunciado:** ${u}\n`+
          `**Motivo:** ${motivo}\n\n`+
          `Envie aqui a **print/vídeo/prova**. `+
          `Quando você enviar um anexo, o Ecco encaminhará a prova para o canal de Administração configurado.`
      });

      if(config.reportChannelId){

        const rc=
          await guild.channels
            .fetch(config.reportChannelId)
            .catch(()=>null);

        if(rc?.isTextBased()){

          await rc.send(
            `🚨 Novo report aberto: ${ch} | `+
            `Denunciante: ${i.user} | `+
            `Denunciado: ${u} | `+
            `Motivo: ${motivo}`
          ).catch(()=>{});
        }
      }

      return visualReply(i, {
        content:
          `✅ Report criado em ${ch}. `+
          `A Administração foi comunicada. Envie a prova dentro do ticket.`,
        ephemeral:true
      });
    }


  }catch(err){

    console.error(err);

    if(
      i.isRepliable() &&
      !i.replied &&
      !i.deferred
    ){

      await i.reply({
        content:
          "❌ Ocorreu um erro ao executar esta ação. Verifique as permissões e a hierarquia do bot.",
        ephemeral:true
      }).catch(()=>{});
    }
  }
});


// =====================================================
// LOGIN
// =====================================================

if(!config.token){

  console.error(
    "DISCORD_TOKEN não configurado. Copie .env.example para .env e preencha."
  );

  process.exit(1);
}

client.login(config.token);
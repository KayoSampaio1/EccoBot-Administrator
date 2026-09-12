const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

function userOpt(o) {
  return o.addUserOption(x =>
    x.setName("usuario")
      .setDescription("Usuário")
      .setRequired(true)
  );
}

module.exports = [

  new SlashCommandBuilder()
    .setName("ma")
    .setDescription("Ações administrativas Ecco")
    .setDMPermission(false)
    .addSubcommand(s =>
      userOpt(
        s.setName("mute")
          .setDescription("Adiciona tempo de mute")
      )
        .addIntegerOption(o =>
          o.setName("minutos")
            .setDescription("Minutos adicionais")
            .setRequired(true)
            .setMinValue(1)
        )
        .addStringOption(o =>
          o.setName("motivo")
            .setDescription("Motivo")
        )
    )
    .addSubcommand(s =>
      userOpt(
        s.setName("limite")
          .setDescription("Redefine o limite de xingamentos")
      )
        .addIntegerOption(o =>
          o.setName("limite")
            .setDescription("Novo limite")
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand(s =>
      userOpt(
        s.setName("dm")
          .setDescription("Envia aviso privado")
      )
        .addStringOption(o =>
          o.setName("mensagem")
            .setDescription("Mensagem")
            .setRequired(true)
        )
    ),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bane um usuário")
    .setDMPermission(false)
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuário")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo")
    ),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsa um usuário")
    .setDMPermission(false)
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuário")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo")
    ),

  new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Aplica mute/timeout")
    .setDMPermission(false)
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuário")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("minutos")
        .setDescription("Duração")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320)
    )
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo")
    ),

  new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Remove mute")
    .setDMPermission(false)
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuário")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Adverte um usuário")
    .setDMPermission(false)
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuário")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Consulta advertências")
    .setDMPermission(false)
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuário")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Apaga mensagens recentes")
    .setDMPermission(false)
    .addIntegerOption(o =>
      o.setName("quantidade")
        .setDescription("1 a 100")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  new SlashCommandBuilder()
    .setName("removeallmsg")
    .setDescription("Remove mensagens do canal configurado")
    .setDMPermission(false),

  new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Bloqueia o canal")
    .setDMPermission(false),

  new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Desbloqueia o canal")
    .setDMPermission(false),

  new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Define o slowmode")
    .setDMPermission(false)
    .addIntegerOption(o =>
      o.setName("segundos")
        .setDescription("0 a 21600")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    ),

  new SlashCommandBuilder()
    .setName("antilink")
    .setDescription("Liga/desliga Anti-link")
    .setDMPermission(false)
    .addSubcommand(s =>
      s.setName("on")
        .setDescription("Ativa")
    )
    .addSubcommand(s =>
      s.setName("off")
        .setDescription("Desativa")
    ),

  new SlashCommandBuilder()
    .setName("antispam")
    .setDescription("Liga/desliga Anti-spam")
    .setDMPermission(false)
    .addSubcommand(s =>
      s.setName("on")
        .setDescription("Ativa")
    )
    .addSubcommand(s =>
      s.setName("off")
        .setDescription("Desativa")
    ),

  new SlashCommandBuilder()
    .setName("automod")
    .setDescription("Liga/desliga AutoMod")
    .setDMPermission(false)
    .addSubcommand(s =>
      s.setName("on")
        .setDescription("Ativa")
    )
    .addSubcommand(s =>
      s.setName("off")
        .setDescription("Desativa")
    ),

  new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Configura logs")
    .setDMPermission(false)
    .addSubcommand(s =>
      s.setName("configurar")
        .setDescription("Usa o canal atual como canal de logs")
    ),

  new SlashCommandBuilder()
    .setName("set")
    .setDescription("Configurações administrativas")
    .setDMPermission(false)

    .addSubcommand(s =>
      s.setName("cargo")
        .setDescription("Adiciona/remove cargo")
        .addUserOption(o =>
          o.setName("usuario")
            .setDescription("Usuário")
            .setRequired(true)
        )
        .addRoleOption(o =>
          o.setName("cargo")
            .setDescription("Cargo")
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName("acao")
            .setDescription("Ação")
            .addChoices(
              { name: "adicionar", value: "add" },
              { name: "remover", value: "remove" }
            )
        )
    )

    .addSubcommand(s =>
      s.setName("canal-logs")
        .setDescription("Define canal de logs")
        .addChannelOption(o =>
          o.setName("canal")
            .setDescription("Canal")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )

    .addSubcommand(s =>
      s.setName("canal-reports")
        .setDescription("Define canal para receber provas de reports")
        .addChannelOption(o =>
          o.setName("canal")
            .setDescription("Canal")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )

    .addSubcommand(s =>
      s.setName("cargo-protegido")
        .setDescription("Protege/desprotege um cargo")
        .addRoleOption(o =>
          o.setName("cargo")
            .setDescription("Cargo")
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName("acao")
            .setDescription("Ação")
            .addChoices(
              { name: "adicionar", value: "add" },
              { name: "remover", value: "remove" }
            )
        )
    )

    .addSubcommand(s =>
      s.setName("whitelist-canal")
        .setDescription("Whitelist de canal")
        .addChannelOption(o =>
          o.setName("canal")
            .setDescription("Canal")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName("acao")
            .setDescription("Ação")
            .addChoices(
              { name: "adicionar", value: "add" },
              { name: "remover", value: "remove" }
            )
        )
    )

    .addSubcommand(s =>
      s.setName("whitelist-cargo")
        .setDescription("Whitelist de cargo")
        .addRoleOption(o =>
          o.setName("cargo")
            .setDescription("Cargo")
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName("acao")
            .setDescription("Ação")
            .addChoices(
              { name: "adicionar", value: "add" },
              { name: "remover", value: "remove" }
            )
        )
    )

    .addSubcommand(s =>
      s.setName("palavra")
        .setDescription("Adiciona/remove palavra filtrada")
        .addStringOption(o =>
          o.setName("palavra")
            .setDescription("Palavra")
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName("acao")
            .setDescription("Ação")
            .addChoices(
              { name: "adicionar", value: "add" },
              { name: "remover", value: "remove" }
            )
        )
    )

    // NOVO: MODO DE TESTE
    .addSubcommand(s =>
      s.setName("modo-teste")
        .setDescription("Ativa/desativa o modo de teste da moderação")
        .addStringOption(o =>
          o.setName("acao")
            .setDescription("Ação")
            .setRequired(true)
            .addChoices(
              { name: "Ativar", value: "on" },
              { name: "Desativar", value: "off" }
            )
        )
    ),

  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Abre o painel de configuração Ecco")
    .setDMPermission(false),

  new SlashCommandBuilder()
    .setName("verifc")
    .setDescription("Verifica as últimas 100 mensagens novamente")
    .setDMPermission(false),

  new SlashCommandBuilder()
    .setName("report")
    .setDescription("Denuncia um usuário")
    .setDMPermission(false)
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuário denunciado")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo")
        .setRequired(true)
    )

].map(x => x.toJSON());
# Ecco Admin

Bot de moderação/administração para Discord em **Node.js + discord.js v14**.

## Recursos

- Anti-spam automático com advertências 1/3, 2/3, 3/3 e mute automático de 10 minutos.
- Anti-link.
- AutoMod com lista de palavras personalizada.
- `/verifc` para revisar as últimas 100 mensagens sem contar novamente uma mensagem já processada.
- Anti-raid por pico de entradas.
- Anti-bot configurável.
- Detecção de conta suspeita por idade da conta.
- Logs de punições e ações administrativas: quem puniu, quem foi punido, motivo e horário.
- `/ban`, `/kick`, `/mute`, `/unmute`, `/warn`, `/warnings`, `/clear`, `/lock`, `/unlock`, `/slowmode`.
- `/ma` para ações administrativas: ampliar mute, redefinir limite individual e enviar DM.
- `/report` cria ticket privado e encaminha provas para o canal de reports configurado.
- `/set cargo`, `/set canal-logs`, `/set canal-reports`.
- Cargos protegidos e whitelists de canais/cargos.
- `/panel` com painel de configuração e botões para os principais filtros.
- `/removeallmsg` apaga mensagens do canal específico configurado para reports (ou do canal atual, conforme configuração/permissões).

## Instalação

1. Instale Node.js 20+.
2. Abra esta pasta no VS Code.
3. Rode `npm install`.
4. Copie `.env.example` para `.env`.
5. Preencha `DISCORD_TOKEN`, `CLIENT_ID` e `GUILD_ID`.
6. O cargo Admin+ já está definido como `1548394825009864734`, mas pode ser alterado no `.env`.
7. Registre os slash commands com `npm run deploy`.
8. Inicie com `npm start`.

## Intents e permissões do bot

No Developer Portal, habilite **Message Content Intent** e **Server Members Intent**.

Recomendado para o bot: View Channels, Send Messages, Manage Messages, Moderate Members, Manage Channels, Manage Roles, Kick Members, Ban Members, Read Message History e Attach Files.

O cargo do bot precisa estar acima dos cargos que ele deve gerenciar/punir.

## Palavra filtrada

Edite pelo comando:

`/set palavra palavra:exemplo acao:adicionar`

A lista inicial contém placeholders (`palavrao1`, `palavrao2`, `palavrao3`). Substitua/remova e adicione as palavras que o servidor realmente quer bloquear.

## Configuração rápida

- `/logs configurar` — transforma o canal atual em canal de logs.
- `/set canal-logs` — escolhe o canal de logs.
- `/set canal-reports` — escolhe o canal que recebe as provas dos reports.
- `/panel` — painel de configuração.
- `/set cargo-protegido` — impede punições automáticas e administrativas nesse cargo.
- `/set whitelist-canal` — ignora filtros no canal escolhido.
- `/set whitelist-cargo` — ignora filtros para quem possui o cargo escolhido.

## Segurança

Nunca coloque o token diretamente no código ou envie o token para outra pessoa. Use somente o `.env` local.

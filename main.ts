import {
  ApplicationCommandOptionTypes,
  createBot,
  Intents,
  InteractionResponseTypes,
  startBot,
} from "./deps.ts";
import { Secret } from "./secret.ts";
import * as db from "./src/database.ts";
import { DateTime, DAY } from "./src/datetime.ts";
import {
  checkNewSubmission,
  checkSubmissionInterval,
} from "./src/functions/broadcast_submissions.ts";
import {
  checkNewContest,
  contestsNotifyTime,
} from "./src/functions/notify_today_contests.ts";

const bot = createBot({
  token: Secret.DISCORD_TOKEN,
  intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,
  events: {
    ready: (bot, payload) => {
      console.log(`${payload.user.username} is ready!`);

      // 当日のコンテストをお知らせ
      // 0秒後と、あとは1時間間隔で実行

      DateTime.registerScheduledIntervalEvent(
        () => checkNewContest(bot, payload.guilds),
        DateTime.nextInterval(contestsNotifyTime, DAY),
        DAY,
      );

      // ユーザーの提出を表示
      DateTime.registerScheduledIntervalEvent(
        () => checkNewSubmission(bot, payload.guilds, "ZOIZOI"),
        DateTime.nextInterval(
          { hour: 0 },
          DateTime.deltaToMillisec(checkSubmissionInterval),
        ),
        DateTime.deltaToMillisec(checkSubmissionInterval),
      );

      // command
      bot.helpers.createGlobalApplicationCommand({
        name: "atcoder",
        description: "AtCoderのBotの設定コマンドです",
        options: [
          {
            type: ApplicationCommandOptionTypes.SubCommand,
            name: "setchannel",
            description: "Botが投稿するチャンネルを指定します",
            options: [],
          },
        ],
      });
    },
    async interactionCreate(client, interaction) {
      if (interaction.data?.name === "atcoder") {
        if (interaction.data?.options?.[0].name === "setchannel") {
          db.setBotChannel(interaction.guildId!, interaction.channelId!);
          return await client.helpers.sendInteractionResponse(
            interaction.id,
            interaction.token,
            {
              type: InteractionResponseTypes.ChannelMessageWithSource,
              data: { content: "設定完了!" },
            },
          );
        }
      }
    },
  },
});

bot.events.messageCreate = (bot, message) => {
  if (message.content === "") {
    bot.helpers.sendMessage(message.channelId, {
      content: "にゃーん",
    });
  }
};

await startBot(bot);

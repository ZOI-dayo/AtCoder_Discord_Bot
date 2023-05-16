import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
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
} from "./src/functions/submissions.ts";
import {
  checkNewContest,
  contestsNotifyTime,
} from "./src/functions/notify_contest.ts";
import { getAJLSchoolData } from "./src/atcoder.ts";

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
            type: ApplicationCommandOptionTypes.SubCommandGroup,
            name: "set",
            description: "Botの設定を変更します",
            options: [
              {
                type: ApplicationCommandOptionTypes.SubCommand,
                name: "channel",
                description: "Botが投稿するチャンネルを指定します",
              },
              {
                type: ApplicationCommandOptionTypes.SubCommand,
                name: "school",
                description: "このサーバーの学校情報を指定します",
                options: [
                  {
                    type: ApplicationCommandOptionTypes.String,
                    name: "学校名",
                    description: "正式名称で入力してください",
                    required: true,
                    // 多分、 https://www.mext.go.jp/b_menu/toukei/mext_01087.html あたりを使って選択肢出した方がいいよね...
                  },
                  {
                    type: ApplicationCommandOptionTypes.String,
                    name: "区分",
                    description: "中学/高校",
                    choices: [
                      {
                        name: "中学",
                        value: "junior",
                      },
                      {
                        name: "高校",
                        value: "high",
                      },
                    ],
                    required: true,
                  },
                ],
              },
            ],
          },
          {
            type: ApplicationCommandOptionTypes.SubCommandGroup,
            name: "get",
            description: "Botの設定を取得します",
            options: [
              {
                type: ApplicationCommandOptionTypes.SubCommand,
                name: "channel",
                description: "Botが投稿するチャンネルを取得します",
              },
              {
                type: ApplicationCommandOptionTypes.SubCommand,
                name: "school",
                description: "このサーバーの学校情報を取得します",
              },
            ],
          },
        ],
      });

      payload.guilds.forEach(guild => {
        const schoolData = db.getSchoolData(guild);
        if(schoolData === undefined) return;
        getAJLSchoolData(DateTime.now().year, schoolData.category, schoolData.name).then(
          (e) => console.log(e),
        );
      });
    },
    async interactionCreate(client, interaction) {
      if (interaction.data?.name === "atcoder") {
        if (interaction.data?.options?.[0].name === "set") {
          if (interaction.data?.options?.[0].options?.[0].name === "channel") {
            db.setBotChannel(interaction.guildId!, interaction.channelId!);
            return await client.helpers.sendInteractionResponse(
              interaction.id,
              interaction.token,
              {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: { content: "設定完了!" },
              },
            );
          } else if (
            interaction.data?.options?.[0].options?.[0].name === "school"
          ) {
            const response = interaction.data?.options?.[0].options?.[0]
              .options!;
            db.setSchoolData(
              interaction.guildId!,
              response.find((r) => r.name === "学校名")?.value! as string,
              response.find((r) => r.name === "区分")?.value! as "junior" | "high",
            );
            return await client.helpers.sendInteractionResponse(
              interaction.id,
              interaction.token,
              {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: { content: "設定完了!" },
              },
            );
          }
        } else if(interaction.data?.options?.[0].name === "get") {
          if (interaction.data?.options?.[0].options?.[0].name === "channel") {
            return await client.helpers.sendInteractionResponse(
              interaction.id,
              interaction.token,
              {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: { content: `返信チャンネルのIDは${db.getBotChannel(interaction.guildId!)}です` },
              },
            );
          } else if (
            interaction.data?.options?.[0].options?.[0].name === "school"
          ) {
            const data = db.getSchoolData(interaction.guildId!);
            return await client.helpers.sendInteractionResponse(
              interaction.id,
              interaction.token,
              {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: { content: `設定された学校は${data?.name}(区分は${data?.category === "junior" ? "中学" : "高校"})` },
              },
            );
          }
        }
      }
    },
  },
});

await startBot(bot);

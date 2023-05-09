import { createBot, Intents, startBot } from "./deps.ts";
import { Secret } from "./secret.ts";
import { registerUser } from "./src/functions/broadcast_submissions.ts";
import { registerContests } from "./src/functions/notify_today_contests.ts";

const bot = createBot({
  token: Secret.DISCORD_TOKEN,
  intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,
  events: {
    ready: (bot, payload) => {
      console.log(`${payload.user.username} is ready!`);

      // 当日のコンテストをお知らせ
      // 0秒後と、あとは1時間間隔で実行
      registerContests(bot, payload.guilds)
      setInterval(() => registerContests(bot, payload.guilds), 1000 * 60 * 60);

      // ユーザーの提出を表示
      registerUser(bot, payload.guilds, "ZOIZOI");

    },
  },
});

bot.events.messageCreate = (bot, message) => {
  if (message.content === "!neko") {
    bot.helpers.sendMessage(message.channelId, {
      content: "にゃーん",
    });
  }
};

await startBot(bot);

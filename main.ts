import { createBot, Intents, startBot } from "./deps.ts";
import { Secret } from "./secret.ts";
import { registerContests } from "./src/functions/notify_contests.ts";

const bot = createBot({
  token: Secret.DISCORD_TOKEN,
  intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,
  events: {
    ready: (bot, payload) => {
      console.log(`${payload.user.username} is ready!`);

      registerContests(bot, payload.guilds)
      setInterval(() => registerContests(bot, payload.guilds), 1000 * 60 * 60);
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

// getSubmissions("ZOIZOI", 1682435173);
// atcoder.getContests()
// atcoder.getStandings("abc301")

await startBot(bot);

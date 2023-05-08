import { createBot, Intents, ScheduledEventEntityType, startBot } from "./deps.ts"
import { Secret } from "./secret.ts"
import * as atcoder from "./atcoder.ts"
import { createScheduledEvent } from "https://deno.land/x/discordeno@18.0.1/mod.ts";

const bot = createBot({
    token: Secret.DISCORD_TOKEN,
    intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,
    events: {
        ready: (bot, payload) => {
            console.log(`${payload.user.username} is ready!`);
            
            atcoder.getScheduledContests().then(contests => contests.filter(c => c.startTime < Date.now() + 1000*60*60*24*3).forEach(contest => {
                payload.guilds.forEach(guild => {
                    // コンテスト通知を送る、という関数
                    const notifyContestMessage = () => {
                        bot.helpers.getChannels(guild).then(channels => {
                            const channel = channels.find(c => c.name?.includes("atcoder通知") ?? false);
                            if(channel == null) return;
                            bot.helpers.sendMessage(channel.id, {
                                content: `AtCoderのコンテスト通知です! コンテストは${contest.name}です!`,
                            })
                        })
                    };
                    setTimeout(notifyContestMessage, Date.parse("2023-05-09T00:25:00.000+09:00") - Date.now());
                    console.log(Date.parse("2023-05-09T00:25:00.000+09:00") - Date.now())
                });
            }));
            // atcoder.getContests().then(e => {console.log(e.filter(c => (Date.now() / 1000) < c.start_epoch_second)); console.log(Date.now())});
            
        },
    },
})

bot.events.messageCreate = (bot, message) => {
    if (message.content === "!neko") {
        bot.helpers.sendMessage(message.channelId, {
            content: "にゃーん",
        })
    }
}

// getSubmissions("ZOIZOI", 1682435173);
// atcoder.getContests()
// atcoder.getStandings("abc301")

await startBot(bot)
import { BigString, Bot } from "../../deps.ts";
import * as atcoder from "../atcoder.ts";

let registered: string[] = [];

export const registerContests = async (bot: Bot, guilds: BigString[]) => {
  (await atcoder.getScheduledContests())
  /*
    .filter((c) => !registered.includes(c.url)).filter((c) =>
      c.startTime.isBefore(datetime().add({ day: 7 }))
    )
    */
    .forEach((contest) => {
      guilds.forEach((guild) => {
        // コンテスト通知を送る、という関数
        const notifyContestMessage = () => {
          bot.helpers.getChannels(guild).then((channels) => {
            const channel = channels.find((c) =>
              c.name?.includes("atcoder通知") ?? false
            );
            if (channel == null) return;
            bot.helpers.sendMessage(channel.id, {
              content: `本日${
                contest.startTime.format("HH:mm")
              }、AtCoderでコンテストが開催されます\nぜひ参加してください!`,
              embeds: [
                {
                  author: {
                    name: "AtCoder",
                    url: contest.url,
                  },
                  color: 8472940,
                  description: "ぜひ参加してください",
                  fields: [
                    {
                      name: "時間",
                      value: contest.duration,
                    },
                    {
                      name: "Rated対象",
                      value: contest.ratedRange,
                    },
                  ],
                  timestamp: contest.startTime.data,
                  title: contest.name,
                  url: contest.url,
                },
              ],
            });
          });
        };
        // コンテストのある日の朝9時にDiscordにアナウンス
        setTimeout(
          notifyContestMessage,
          contest.startTime.startOfDay().add({hour: 22, minute: 0}).distanseFromNow()
          // Math.floor((contest.startTime + 1000*60*60*9) / 1000*60*60*24) * 1000*60*60*24 - Date.now(),
        );
        console.log(
          `コンテスト「${contest.name}」のアナウンスを${
            contest.startTime.startOfDay().add({hour: 22, minute: 0}).format("HH:mm")
            // (Math.floor((contest.startTime + 1000*60*60*9) / 1000*60*60*24) * 1000*60*60*24 - Date.now()).toString()
          }に予約しました`, // メッセージが間違ってる気がする
        );
        // console.log(contest.startTime.toZonedTime("Asia/Tokyo").hour)
        registered.push(contest.url);
        // コンテスト開始5分後にリストから削除
        setTimeout(
          () => registered = registered.filter((url) => url != contest.url),
          contest.startTime.add({minute: 5}).distanseFromNow()
          // contest.startTime + 1000 * 60 * 5 - Date.now()
        );
      });
    });
};

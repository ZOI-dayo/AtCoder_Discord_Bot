import { BigString, Bot, datetime, diffInMillisec } from "../../deps.ts";
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
                  timestamp: contest.startTime.toMilliseconds(),
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
          diffInMillisec(
            datetime(),
            contest.startTime.subtract({ hour: 9 }).startOfDay().add({
              hour: 9,
            }),
          ),
        );
        console.log(
          `コンテスト「${contest.name}」のアナウンスを${
            contest.startTime.subtract({ hour: 9 }).startOfDay().add({
              hour: 9 + 9, // startOfDay()がUTCの0時、つまり日本ではUTCでの-9時、つまり結局UTC表記で-18時の値になるらしいので、18足す(バグやばすぎ、どうにかしたい)
            }).add({hour: 9}).format("MM/dd HH:mm ZZ")
          }に予約しました`,
        );
        registered.push(contest.url);
        // コンテスト開始5分後にリストから削除
        setTimeout(
          () => registered = registered.filter((url) => url != contest.url),
          diffInMillisec(
            datetime(),
            contest.startTime.add({ minute: 5 }),
          ),
        );
      });
    });
};

import { BigString, Bot } from "../../deps.ts";
import * as atcoder from "../atcoder.ts";

let registered: string[] = [];

export const registerContests = async (bot: Bot, guilds: BigString[]) => {
  (await atcoder.getScheduledContests())
    .forEach((contest) => {
      guilds.forEach((guild) => {
        // コンテスト通知を送る、という関数
        const notifyContestMessage = (mode: "today" | "soon") => {
          bot.helpers.getChannels(guild).then((channels) => {
            const channel = channels.find((c) =>
              // 送信先チャンネルはここで指定
              c.name?.includes("atcoder通知") ?? false
            );
            if (channel == null) return;
            bot.helpers.sendMessage(channel.id, {
              content: mode == "today"
                ? `本日${
                  contest.startTime.format("HH:mm")
                }、AtCoderでコンテストが開催されます`
                : `30分後にAtCoderでコンテストが開催されます\n参加予定の方は頑張ってください!`,
              embeds: [
                {
                  author: {
                    name: "AtCoder",
                    url: contest.url,
                  },
                  color: 0x337ab7,
                  description: mode == "today" ? "ぜひ参加してください" : "皆さん頑張ってください!",
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
        const announce_date = contest.startTime.startOfDay().add({
          hour: 9,
          minute: 0,
        });
        setTimeout(
          notifyContestMessage,
          announce_date.distanseFromNow(),
        );
        console.log(
          `コンテスト「${contest.name}」のアナウンスを${
            announce_date.format("HH:mm")
          }に予約しました`,
        );
        registered.push(contest.url);
        // コンテスト開始5分後にリストから削除
        setTimeout(
          () => registered = registered.filter((url) => url != contest.url),
          contest.startTime.add({ minute: 5 }).distanseFromNow(),
        );
      });
    });
};

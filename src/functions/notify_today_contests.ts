import { Bot } from "../../deps.ts";
import * as atcoder from "../atcoder.ts";
import { DAY, TimeDelta } from "../datetime.ts";
import * as db from "../database.ts";

export const contestsNotifyTime: TimeDelta = {
  hour: 7,
  minute: 0,
};
export const checkNewContest = async (bot: Bot, guilds: bigint[]) => {
  console.log("新規コンテストがないか確認中...");
  const contests = (await atcoder.getScheduledContests()).filter((c) =>
    0 < c.startTime.distanseFromNow() &&
    c.startTime.distanseFromNow() < DAY
  );
  if(contests.length > 1) console.log(`今日開催予定のコンテストが見つかりました: ${contests}`)
  contests.forEach((contest) => {
    guilds.forEach((guild) => {
      // コンテスト通知を送る、という関
      const notifyContestMessage = async (mode: "today" | "soon") => {
        const channel = await bot.helpers.getChannel(db.getBotChannel(guild));
        if (channel == null) return;
        bot.helpers.sendMessage(channel.id, {
          content: mode == "today"
            ? `本日${
              contest.startTime.format("HH:mm")
            }、AtCoderでコンテストが開催されます`
            : `30分後にAtCoderでコンテストが開催されます\n参加予定の方は頑張ってください!`,
            // こんなことするよりURL埋め込みの方がいい...?
          embeds: [
            {
              author: {
                name: "AtCoder",
                url: contest.url,
              },
              color: 0x337ab7,
              description: mode == "today"
                ? "ぜひ参加してください"
                : "皆さん頑張ってください!",
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
      };

      // コンテストのある日の朝9時にDiscordにアナウンス
      notifyContestMessage("today");
      /*
      const announce_date = contest.startTime.startOfDay().add(contestsNotifyTime);
      DateTime.registerEvent(() => {
        notifyContestMessage("today");
      }, announce_date);
      console.log(
        `コンテスト「${contest.name}」のアナウンスを${
          announce_date.format("yyyy/MM/dd HH:mm")
        }に予約しました`,
      );
      registered.push(contest.url);
      DateTime.registerEvent(
        () => registered = registered.filter((url) => url != contest.url),
        contest.startTime.add({ minute: 5 }),
      );
      */
      /*
      setTimeout(
        () => notifyContestMessage("today"),
        announce_date.distanseFromNow(),
      );
      console.log(
        `コンテスト「${contest.name}」のアナウンスを${
          announce_date.format("yyyy/MM/dd HH:mm")
        }に予約しました`,
      );
      registered.push(contest.url);
      // コンテスト開始5分後にリストから削除
      setTimeout(
        () => registered = registered.filter((url) => url != contest.url),
        contest.startTime.add({ minute: 5 }).distanseFromNow(),
      );
      */
    });
  });
};

import { Bot } from "../../deps.ts";
import * as atcoder from "../atcoder.ts";
import { DateTime, DAY, TimeDelta } from "../datetime.ts";
import * as db from "../database.ts";
import { registerRateChanged } from "./rate_change.ts";
import { registerClarChanged } from "./clar.ts";

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
  if (contests.length > 1) {
    console.log(`今日開催予定のコンテストが見つかりました: ${contests}`);
  }
  contests.forEach((contest) => {
    guilds.forEach((guild) => {
      (async () => {
        const channel = await bot.helpers.getChannel(db.getBotChannel(guild));
        if (channel == null) return;
        bot.helpers.sendMessage(channel.id, {
          content: `本日${
contest.startTime.format("HH:mm")
}、AtCoderでコンテストが開催されます\n${contest.url}`,
        });
      })();
      const contest_id = contest.url.split("/").slice(-1)[0];
      DateTime.registerEvent(() => {
        registerRateChanged(bot, guild, contest_id);
        registerClarChanged(bot, guild, contest_id, contest.startTime.add({
          hour: parseInt(contest.duration.split(":")[0]),
          minute: parseInt(contest.duration.split(":")[1])
        }));
      }, contest.startTime);
    });
  });
};

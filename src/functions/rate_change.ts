import { Bot } from "../../deps.ts";
import * as atcoder from "../atcoder.ts";
import { ContestResult } from "../atcoder.ts";
import * as db from "../database.ts";
import { MINUTE } from "../datetime.ts";

export const registerRateChanged = (bot: Bot, guild: bigint, contest: string) => {
  const sendMessage = async () : Promise<void> => {
    console.log(`${contest}のレート変動がないか確認中...`);
    const contest_result = await atcoder.getContestResult(contest);
    if(contest_result.length == 0) {
      setTimeout(sendMessage, MINUTE * 5);
      return;
    }
    const results : ContestResult[] = [];
    const players = db.getAtCoderPlayers(guild);
    players.forEach((player) => {
      const user_data = contest_result.find((result) => result.UserScreenName === player.name);
      if(user_data == undefined) return;
      results.push(user_data);
    });
    results.sort((a, b) => a.Place < b.Place ? -1 : 1);

    const channel_id = db.getBotChannel(guild);
    if(channel_id == BigInt(-1)) return;
    const channel = await bot.helpers.getChannel(channel_id);
    if (channel == null) return;
    const content = results.map((result) => {
      const diff = result.NewRating - result.OldRating;
      return `${result.UserScreenName}:\n\t${result.Place}位\n\tレート: ${result.OldRating} -> ${result.NewRating} ( ${diff >= 0 ? "+" : ""}${diff} )\n\tパフォーマンス: ${result.Performance}perf`;
    }).join("\n")
    bot.helpers.sendMessage(channel.id, {
      content: `${contest_result[0].ContestName}のレートが反映されました!\n${content}`,
    });
  };
  sendMessage();
};

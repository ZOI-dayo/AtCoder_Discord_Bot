import { Bot } from "../../deps.ts";
import * as atcoder from "../atcoder.ts";
import * as db from "../database.ts";

export const checkAJLRankChanged = async (bot: Bot, guilds: bigint[]) => {
  console.log("AJLのレート変動がないか確認中...");
  guilds.forEach(async guild => {
    const school = db.getSchoolData(guild);
    if(school == undefined) return;
    // TODO
    const ajl_hash = db.getAJLHash(school.name, school.category);
    const latest_data = await atcoder.getAJLSchoolData(new Date().getFullYear(), school.category, school.name);
    if(latest_data == undefined) return;
    if(ajl_hash == undefined) {
      db.setAJLRank(school.name, school.category, latest_data.rank, latest_data.hash);
      return;
    }
    if(ajl_hash.hash !== latest_data.hash) {
      console.log("AJLのレート変動がありました。")
      console.log(`変動前: ${ajl_hash.rank}位`)
      console.log(`変動後: ${latest_data.rank}位`)
      db.setAJLRank(school.name, school.category, latest_data.rank, latest_data.hash);
      const channel = await bot.helpers.getChannel(db.getBotChannel(guild));
      if (channel == null) return;
      bot.helpers.sendMessage(channel.id, {
        content: `AJLの順位が、${ajl_hash.rank}から${latest_data.rank}に変わりました`,
      });
    } else {
      console.log("AJLのレート変動はありませんでした。")
    }
  });
};

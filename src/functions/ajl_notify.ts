import { Bot } from "../../deps.ts";
import * as atcoder from "../atcoder.ts";
import * as db from "../database.ts";

export const checkAJLRankChanged = async (bot: Bot, guilds: bigint[]) => {
  console.log("AJLのレート変動がないか確認中...");
  for(const guild of guilds) {
    console.log(guild)
    const school = await db.getSchoolData(guild);
    if(school == undefined) continue;
    const ajl_hash = await db.getAJLHash(school.name, school.category);
    const latest_data = await atcoder.getAJLSchoolData(new Date().getFullYear(), school.category, school.name);
    if(ajl_hash == undefined) {
      console.log(latest_data);
      db.setAJLRank(school.name, school.category, latest_data.rank, latest_data.hash);
      continue;
    }
    if(latest_data == undefined) continue;
    if(ajl_hash !== latest_data.hash) {
      console.log("AJLのレート変動がありました。")
      console.log(`変動前: ${ajl_hash.rank}位`)
      console.log(`変動後: ${latest_data.rank}位`)
      db.setAJLRank(school.name, school.category, latest_data.rank, latest_data.hash);
    } else {
      console.log("AJLのレート変動はありませんでした。")
    }
  }
  /*
  guilds.forEach(async (guild) => {
    const data = await atcoder.getAJLSchoolData(new Date().getFullYear(), school.category, school.name);
    console.log(data)
  });
  */
};

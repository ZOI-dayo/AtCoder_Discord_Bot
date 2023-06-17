import { Bot } from "../../deps.ts";
import * as atcoder from "../atcoder.ts";
import * as db from "../database.ts";
import { DateTime, MINUTE } from "../datetime.ts";

export const registerClarChanged = async (bot: Bot, guild: bigint, contest: string, endTime: DateTime) => {
  let cached_clar = await atcoder.getClar(contest);
  const sendMessage = async () : Promise<void> => {
    if(DateTime.now().data > endTime.data) return;
    const latest_clar = await atcoder.getClar(contest);
    if(latest_clar === cached_clar) {
      setTimeout(sendMessage, MINUTE);
      return;
    }
    const new_clar = latest_clar.filter((clar) => !cached_clar.includes(clar));
    cached_clar = latest_clar;
    const channel_id = db.getBotChannel(guild);
    if(channel_id == BigInt(-1)) return;
    const channel = await bot.helpers.getChannel(channel_id);
    if (channel == null) return;
    new_clar.forEach((clar) => {
      bot.helpers.sendMessage(channel.id, {
        content: `新しいClarが投稿されました\nQ:\n${clar.clarfication}\nA:\n${clar.response}`,
      });
    });
  };
  sendMessage();
};

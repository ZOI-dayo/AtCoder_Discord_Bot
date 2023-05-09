import { BigString, Bot } from "../../deps.ts";
import * as atcoder from "../atcoder.ts";

export const registerUser = async (
  bot: Bot,
  guilds: BigString[],
  username: string,
) => {
  const problems = await atcoder.getProblems();
  console.log("aa");

  let last_checked = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 7;
  const updateSubmission = async () => {
    const submissions = await (atcoder.getSubmissions(
      username,
      last_checked, // (仮) 1週間分さかのぼる
    ));
    last_checked = Math.floor(Date.now() / 1000);
    submissions.filter((submission) => submission.result == "AC").forEach(
      (submission) => {
        const problem = problems.find((p) => p.id == submission.problem_id);
        if (problem == undefined) return;
        guilds.forEach((guild) => {
          bot.helpers.getChannels(guild).then((channels) => {
            const channel = channels.find((c) =>
              // 送信先チャンネルはここで指定
              c.name?.includes("atcoder通知") ?? false
            );
            if (channel == null) return;
            bot.helpers.sendMessage(channel.id, {
              content: `${submission.user_id}さんがACしました!`,
              embeds: [
                {
                  author: {
                    name: "AtCoder",
                    url:
                      `https://atcoder.jp/contests/${submission.contest_id}/submissions/${submission.id}`,
                  },
                  color: 0x337ab7,
                  description:
                    `${submission.user_id}さんが、${problem.contest_id}の${problem.title}をACしました!`,
                  fields: [
                    {
                      name: "言語",
                      value: submission.language,
                    },
                    {
                      name: "得点",
                      value: submission.point.toString(),
                    },
                    {
                      name: "実行時間",
                      value: submission.execution_time.toString() + "ms",
                    },
                  ],
                  timestamp: submission.epoch_second * 1000,
                  title: problem.title,
                  url:
                    `https://atcoder.jp/contests/${submission.contest_id}/submissions/${submission.id}`,
                },
              ],
            });
          });
        });
      },
    );
  };
  const interval = 1000 * 60; // ms
  setTimeout(
    () => {
      updateSubmission();
      setInterval(updateSubmission, interval);
    },
    Math.ceil(Date.now() / interval) * interval - Date.now(),
  );
};

import { BigString, Bot } from "../../deps.ts";
import * as atcoder from "../atcoder.ts";
import { TimeDelta } from "../datetime.ts";

export const checkSubmissionInterval: TimeDelta = {
  hour: 1,
};

export const checkNewSubmission = async (
  bot: Bot,
  guilds: BigString[],
  username: string,
) => {
  const problems = await atcoder.getProblems();
  console.log("新規提出がないかを確認中...");

  // 単位: [s]
  // あとでcheckSubmissionDeltaを使った実装に変更
  const from_second = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 7;

  const submissions = await atcoder.getSubmissions(
    username,
    from_second,
  );
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

import { Bot } from "../../deps.ts";
import * as atcoder from "../atcoder.ts";
import { TimeDelta } from "../datetime.ts";
import * as db from "../database.ts";

export const checkSubmissionInterval: TimeDelta = {
  minute: 1,
};

let last_check = Math.floor(Date.now() / 1000);

export const checkNewSubmission = async (
  bot: Bot,
  guilds: bigint[],
  username: string,
) => {
  const problems = await atcoder.getProblems();
  console.log("新規提出がないかを確認中...");

  const submissions = await atcoder.getSubmissions(
    username,
    last_check,
  );
  submissions.filter((submission) => submission.result == "AC").forEach(
    (submission) => {
      const problem = problems.find((p) => p.id == submission.problem_id);
      if (problem == undefined) return;
      guilds.forEach(async (guild) => {
          const channel = await bot.helpers.getChannel(db.getBotChannel(guild));
        
          bot.helpers.sendMessage(channel.id, {
            content: `${submission.user_id}さんが、${problem.contest_id}の${problem.title}をACしました!`
          });
      });
      last_check = Math.max(last_check, submission.epoch_second + 1);
    },
  );
};

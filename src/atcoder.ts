import { DOMParser } from "../deps.ts";
import { DateTime } from "./datetime.ts";

// AtCoder Problemsから、特定ユーザーの一定期間におけるすべての提出を取得する
async function getSubmissions(user: string, from_second: number) {
  const response = await (await fetch(
    `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${user}&from_second=${from_second}`,
  )).json();

  type Submission = {
    id: number;
    epoch_second: number;
    problem_id: string;
    contest_id: string;
    user_id: string;
    language: string;
    point: number;
    length: number;
    result:
      | "AC"
      | "WA"
      | "CE"
      | "MLE"
      | "TLE"
      | "RE"
      | "OLE"
      | "IE"
      | "WJ"
      | "WR";
    execution_time: number;
  };
  return response as Submission[];
}

// AtCoder Problemsから、これまでに出題されたすべての問題を取得する
async function getProblems() {
  const response = await (await fetch(
    `https://kenkoooo.com/atcoder/resources/merged-problems.json`,
  )).json();

  type Problem = {
    id: string;
    contest_id: string;
    problem_index: string;
    name: string;
    title: string;
    shortest_submission_id: number;
    shortest_contest_id: string;
    shortest_user_id: string;
    fastest_submission_id: number;
    fastest_contest_id: string;
    fastest_user_id: string;
    first_submission_id: number;
    first_contest_id: string;
    first_user_id: string;
    source_code_length: number;
    execution_time: number;
    point: null | number;
    solver_count: number;
  };
  return response as Problem[];
}

// AtCoder Problemsから、開催済みのすべてのコンテストのリストを取得する
// 過去データしか返さないことに注意
async function getContests() {
  type Contest = {
    id: string;
    start_epoch_second: number;
    duration_second: number;
    title: string;
    rate_change: string;
  };
  const response =
    await (await fetch("https://kenkoooo.com/atcoder/resources/contests.json"))
      .json();
  // console.log(response);
  return response as Contest[];
}

// AtCoder公式ページの「予定されたコンテスト」欄を取得する
async function getScheduledContests() {
  const response = await (await fetch("https://atcoder.jp/contests/?lang=en"))
    .text();
  const document = new DOMParser().parseFromString(response, "text/html");
  if (document == null) throw Error("Failed to parse");

  type ScheduledContest = {
    startTime: DateTime;
    name: string;
    url: string;
    duration: string;
    ratedRange: string;
  };

  const result: ScheduledContest[] = [];

  Array.from(
    document.querySelector(
      "#contest-table-upcoming > .panel > .table-responsive > table > tbody",
    )!.children,
  ).forEach((element) => {
    // if(!element.hasChildNodes()) return;
    const contest: ScheduledContest = {
      startTime: new DateTime(element.children[0].textContent),
      name: element.children[1].children[2].textContent,
      url: `https://atcoder.jp${
        element.children[1].children[2].getAttribute("href")
      }`,
      duration: element.children[2].innerText,
      ratedRange: element.children[3].innerText,
    };
    // console.log(contest);
    result.push(contest);
  });
  result.push({
    startTime: new DateTime("2023/05/10 23:59 +0900"),
    name: "テスト",
    url: "https://example.com/",
    duration: "01:40",
    ratedRange: "~1999",
  });
  return result;
}

async function getStandings(contest: string) {
  // 最近のアップデートのせいでログインしないと見れない
  // Cookie食べさせる?
  const response =
    await (await fetch(`https://atcoder.jp/contests/${contest}/standings/json`))
      .json();
  console.log(response);
  return response;
}

export { getContests, getProblems, getScheduledContests, getStandings, getSubmissions };

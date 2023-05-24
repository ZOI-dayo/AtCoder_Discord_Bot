import { createHash, DOMParser } from "../deps.ts";
import { DateTime } from "./datetime.ts";
import { cache_fetch } from "./fetch.ts";

// AtCoder Problemsから、特定ユーザーの一定期間におけるすべての提出を取得する
export async function getSubmissions(user: string, from_second: number) {
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
export async function getProblems() {
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
export async function getContests() {
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
export async function getScheduledContests() {
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
      startTime: DateTime.from(element.children[0].textContent),
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
    startTime: DateTime.from("2023/05/11 21:00 +0900"),
    name: "テスト",
    url: "https://example.com/",
    duration: "01:40",
    ratedRange: "~1999",
  });
  return result;
}

export async function getStandings(contest: string) {
  // 最近のアップデートのせいでログインしないと見れない
  // Cookie食べさせる?
  const response =
    await (await fetch(`https://atcoder.jp/contests/${contest}/standings/json`))
      .json();
  console.log(response);
  return response;
}

type AJLSchoolData = {
  rank: number;
  name: string;
  prefectures: string;
  score: number;
  players: string[];
  hash: string;
};

// AJL
export async function getAJLSchoolData(year: number, category: "junior" | "high", schoolName: string): Promise<AJLSchoolData | undefined> {
  return (await getAJLSchools(year, category)).find(s => s.name == schoolName);
}

// あまりに遅ければcacheする
export async function getAJLSchools(
  year: number,
  category: "junior" | "high",
): Promise<Array<AJLSchoolData>> {
  const response =
    await (await cache_fetch(
      `https://img.atcoder.jp/ajl${year}/output_${category}_school.html`,
    ));
  const document = new DOMParser().parseFromString(response, "text/html");
  console.log(document?.textContent);
  const schoolElement = Array.from(
    document?.getElementsByTagName("tbody")[0].children!,
  );
  const hash = createHash("sha256").update(response).toString();
  return schoolElement.map(s => {return {
    rank: parseInt(s?.children[0].innerText!),
    name: s?.children[1].innerText!,
    prefectures: s?.children[2].innerText!,
    score: parseInt(s?.children[3].innerText!),
    players: Array.from(s?.children[4].children!).map((p) =>
      p.innerText
    ),
    hash
  }});
}

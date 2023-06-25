import { createHash, DOMParser } from "../deps.ts";
import { DateTime } from "./datetime.ts";
import { cache_fetch } from "./fetch.ts";

/**
 * AtCoder Problemsから取得した提出の型
 */
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

/**
 * AtCoder Problemsから、特定ユーザーの一定期間におけるすべての提出を取得する
 * @param user : AtCoderのユーザー名
 * @param from_second : 取得する期間の開始時刻(UNIX時間)
 * @returns 取得した提出の配列
 */
export const getSubmissions = async (user: string, from_second: number) : Promise<Submission[]> => {
  const response = await (await fetch(
    `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${user}&from_second=${from_second}`,
  )).json();
  return response as Submission[];
}

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

/**
 * AtCoder Problemsから、これまでに出題されたすべての問題を取得する
 * @returns 取得した問題の配列
 */
export const getProblems = async () : Promise<Problem[]> => {
  const response = await (await fetch(
    `https://kenkoooo.com/atcoder/resources/merged-problems.json`,
  )).json();

  return response as Problem[];
}

// AtCoder Problemsから、開催済みのすべてのコンテストのリストを取得する
// 過去データしか返さないことに注意
/*
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
*/


type ScheduledContest = {
  startTime: DateTime;
  name: string;
  url: string;
  duration: string;
  ratedRange: string;
};

/**
 * AtCoder公式ページの「予定されたコンテスト」欄を取得する
 */
export const getScheduledContests = async () : Promise<ScheduledContest[]> => {
  const response = await (await fetch("https://atcoder.jp/contests/?lang=ja"))
    .text();
  const document = new DOMParser().parseFromString(response, "text/html");
  if (document == null) throw Error("Failed to parse");


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
  return result;
}

export type ContestResult = {
  IsRated: boolean,
  Place: number,
  OldRating: number,
  NewRating: number,
  Performance: number,
  ContestName: string,
  ContestNameEn: string,
  ContestScreenName: string,
  EndTime: string,
  ContestType: number,
  UserName: string,
  UserScreenName: string,
  Country: string,
  Affiliation: string,
  Rating: number,
  Competitions: number,
  AtCoderRank: number
}

/**
 * AtCoderの特定のコンテストの結果を取得する
 */
export const getContestResult = async (contest: string) : Promise<ContestResult[]> => {
  return await (await fetch(`https://atcoder.jp/contests/${contest}/results/json`)).json() as ContestResult[];
}

export type Clar = {
  contest_id: string,
  taskName: string,
  username: string,
  clarfication: string,
  response: string,
  public: boolean,
  createdTime: DateTime,
  modifiedTime: DateTime,
}
/**
 * AtCoderのコンテストのClarを取得する
 */
export const getClar = async (contest_id: string) : Promise<Clar[]> => {
  const response = await (await fetch(`https://atcoder.jp/contests/${contest_id}/clarifications`))
    .text();
  const document = new DOMParser().parseFromString(response, "text/html");
  if (document == null) throw Error("Failed to parse");
  const result: Clar[] = [];
  const tbody = document.querySelector("#main-container > .row > :nth-child(2) > div > table > tbody");
  if(tbody == undefined) return [];
  Array.from(
    tbody!.children,
  ).forEach((element) => {
      const clar: Clar = {
        contest_id: contest_id,
        taskName: element.children[0].textContent.trim(),
        username: element.children[1].textContent.trim(),
        clarfication: element.children[2].textContent.trim(),
        response: element.children[3].textContent.trim(),
        public: element.children[4].textContent.trim() === "Yes",
        createdTime: DateTime.from(element.children[5].textContent.trim()),
        modifiedTime: DateTime.from(element.children[6].textContent.trim()),
      };
      result.push(clar);
    });
  return result;
}
/*
export async function getStandings(contest: string) {
  // 最近のアップデートのせいでログインしないと見れない
  // Cookie食べさせる?
  const response =
    await (await fetch(`https://atcoder.jp/contests/${contest}/standings/json`))
      .json();
  console.log(response);
  return response;
}
*/

type AJLSchoolData = {
  rank: number;
  name: string;
  prefectures: string;
  score: number;
  players: string[];
  hash: string;
};

// AJL

/**
 * AJLの学校データを取得する
 */
export const getAJLSchoolData = async (
  year: number,
  category: "junior" | "high",
  schoolName: string
): Promise<AJLSchoolData | undefined> =>  {
  return (await getAJLSchools(year, category)).find(s => s.name == schoolName);
}

/**
 * AJLのすべての学校データを取得する
 */
export const getAJLSchools = async (
  year: number,
  category: "junior" | "high",
): Promise<Array<AJLSchoolData>> => {
  const response =
    await cache_fetch(
      `https://img.atcoder.jp/ajl${year}/output_${category}_school.html`,
    );
  const document = new DOMParser().parseFromString(response, "text/html");
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

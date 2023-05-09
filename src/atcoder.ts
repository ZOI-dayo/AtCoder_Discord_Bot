import { DateTime, datetime, DOMParser } from "../deps.ts";

async function getSubmissions(user: string, from_second: number) {
  const response = await fetch(
    `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${user}&from_second=${from_second}`,
  );
  console.log(await response.json());
  return response;
}

// 過去データしか返さない
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
      startTime: datetime(element.children[0].textContent).toZonedTime("Asia/Tokyo"),
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

async function getStandings(contest: string) {
  // 最近のアップデートのせいでログインしないと見れない
  // Cookie食べさせる?
  const response =
    await (await fetch(`https://atcoder.jp/contests/${contest}/standings/json`))
      .json();
  console.log(response);
  return response;
}

export { getContests, getScheduledContests, getStandings, getSubmissions };

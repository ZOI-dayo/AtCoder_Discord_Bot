import { assertEquals, mock_fetch } from "../deps.ts";
import { getAJLSchoolData, getAJLSchools, getProblems, getScheduledContests, getSubmissions } from "./atcoder.ts";
import { DateTime } from "./datetime.ts";

Deno.test("getSubmissions", async () => {
  mock_fetch.install();
  mock_fetch.mock("GET@/atcoder/atcoder-api/v3/user/submissions", () => {
    return new Response(Deno.readTextFileSync("./test_assets/problems/user_submissions.json"), {
      status: 200,
    });
  });
  try {
    const result = await getSubmissions("chokudai", 0);
    assertEquals(result[0], {
      id: 37190,
      epoch_second: 1344004808,
      problem_id: "tenka1_2012_qualA_4",
      contest_id: "tenka1-2012-qualA",
      user_id: "chokudai",
      language: "C# (Mono 2.10.8.1)",
      point: 100.0,
      length: 2594,
      result: "AC",
      execution_time: 181
    });
  } finally {
    mock_fetch.uninstall();
  }
})

Deno.test("getProlbems", async () => {
  mock_fetch.install();
  mock_fetch.mock("GET@/atcoder/resources/merged-problems.json", () => {
    return new Response(Deno.readTextFileSync("./test_assets/problems/merged-problems.json"), {
      status: 200,
    });
  });
  try {
    const result = await getProblems();
    assertEquals(result[0], {
      id: "APG4b_a",
      contest_id: "APG4b",
      problem_index: "A",
      name: "1.00.はじめに",
      title: "A. 1.00.はじめに",
      shortest_submission_id: 4551111,
      shortest_contest_id: "APG4b",
      shortest_user_id: "morio__",
      fastest_submission_id: 1889783,
      fastest_contest_id: "APG4b",
      fastest_user_id: "Luzhiled",
      first_submission_id: 1889738,
      first_contest_id: "APG4b",
      first_user_id: "beet",
      source_code_length: 14,
      execution_time: 0,
      point: null,
      solver_count: 55312
    });
  } finally {
    mock_fetch.uninstall();
  }
})

Deno.test("getScheduledContests", async () => {
  mock_fetch.install();
  mock_fetch.mock("GET@/contests/", () => {
    return new Response(Deno.readTextFileSync("./test_assets/atcoder/contests_ja.html"), {
      status: 200,
    });
  });
  try {
    const result = await getScheduledContests();
    assertEquals(result[0], {
      startTime: new DateTime(1685188800000),
      name: "日鉄ソリューションズプログラミングコンテスト2023（AtCoder Beginner Contest 303）",
      url: "https://atcoder.jp/contests/abc303",
      duration: "01:40",
      ratedRange: " ~ 1999"
    });
  } finally {
    mock_fetch.uninstall();
  }
})

Deno.test("getAJLSchoolData, getAJLSchools", async () => {
  mock_fetch.install();
  mock_fetch.mock("GET@/ajl2023/output_high_school.html", () => {
    return new Response(Deno.readTextFileSync("./test_assets/atcoder/ajl2023_high.html"), {
      status: 200,
    });
  });
  try {
    const result = await getAJLSchools(2023, "high");
    assertEquals(result[1], {
      rank: 1,
      name: "筑波大学附属駒場高等学校",
      prefectures: "東京",
      score: 1414804,
      players: [
        "Forested",
        "shiomusubi496",
        "Cyanmond",
        "primenumber_zz",
        "ytqm3",
        "anmichi",
        "tada72",
        "Chippppp",
        "Noboru2020",
        "kawaii_kawai",
        "aspi",
        "Ruwinningson"
      ],
      hash: "0dae654d8be34c55f42b629d5cbe4d7bb5eed0fa407b20d0675966a9f8c92e62"
    });
    const result_school = await getAJLSchoolData(2023, "high", "筑波大学附属駒場高等学校");
    assertEquals(result_school, {
      rank: 1,
      name: "筑波大学附属駒場高等学校",
      prefectures: "東京",
      score: 1414804,
      players: [
        "Forested",
        "shiomusubi496",
        "Cyanmond",
        "primenumber_zz",
        "ytqm3",
        "anmichi",
        "tada72",
        "Chippppp",
        "Noboru2020",
        "kawaii_kawai",
        "aspi",
        "Ruwinningson"
      ],
      hash: "0dae654d8be34c55f42b629d5cbe4d7bb5eed0fa407b20d0675966a9f8c92e62"
    });
  } finally {
    mock_fetch.uninstall();
  }
})

import { DOMParser } from "./deps.ts";

async function getSubmissions(user: string, from_second: number) {
    const response = await fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${user}&from_second=${from_second}`);
    console.log(await response.json());
    return response;
}

// 過去データしか返さない
async function getContests() {
    type Contest = {
        id: string,
        start_epoch_second: number,
        duration_second: number,
        title: string,
        rate_change: string
    }
    const response = await (await fetch("https://kenkoooo.com/atcoder/resources/contests.json")).json();
    // console.log(response);
    return response as Contest[];
}

async function getScheduledContests() {
    const response = await (await fetch("https://atcoder.jp/contests/?lang=en")).text();
    const document = new DOMParser().parseFromString(response, "text/html");
    if(document == null) throw Error("Failed to parse");

    type ScheduledContest = {
        startTime: number,
        name: string,
    }

    const result : ScheduledContest[] = [];

    document.querySelector("#contest-table-upcoming > .panel > .table-responsive > table > tbody")?.childNodes.forEach(node => {
        
        if(!node.hasChildNodes()) return;

        const contest : ScheduledContest = {
            startTime: Date.parse(node.childNodes[1].textContent),
            name: node.childNodes[3].childNodes[5].textContent
        };
        result.push(contest);
    });
    return result;
}

async function getStandings(contest: string) {
    // 最近のアップデートのせいでログインしないと見れない
    // Cookie食べさせる?
    const response = await (await fetch(`https://atcoder.jp/contests/${contest}/standings/json`)).json();
    console.log(response);
    return response;
}

export { getSubmissions, getContests, getScheduledContests, getStandings }
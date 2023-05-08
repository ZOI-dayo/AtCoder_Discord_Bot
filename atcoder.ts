async function getSubmissions(user: string, from_second: number) {
    const response = await fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${user}&from_second=${from_second}`);
    console.log(await response.json());
    return response;
}

async function getContests() {
    const response = await (await fetch("https://kenkoooo.com/atcoder/resources/contests.json")).json();
    console.log(response);
    return response;
}

async function getStandings(contest: string) {
    // 最近のアップデートのせいでログインしないと見れない
    // Cookie食べさせる?
    const response = await (await fetch(`https://atcoder.jp/contests/${contest}/standings/json`)).json();
    console.log(response);
    return response;
}

export { getSubmissions, getContests, getStandings }
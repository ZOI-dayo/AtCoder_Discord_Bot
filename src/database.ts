import {DB} from "../deps.ts";

const filename = "bot_data.db";

let channelsInitialized = false;
const initChannels = (db: DB) => {
    db.query("CREATE TABLE IF NOT EXISTS channels(id INTEGER PRIMARY KEY AUTOINCREMENT, guild INTEGER, channel INTEGER)");
    channelsInitialized = true;
}

export const getBotChannel = (guild: bigint) : bigint => {
    const db = new DB(filename);
    if(!channelsInitialized) initChannels(db);

    const guild_data = db.query("SELECT * FROM channels WHERE guild=?", [guild]);
    db.close();
    if(guild_data.length == 0) {
        console.warn("送信先チャンネルが登録されていません");
        return BigInt(-1);
    } else{
        return guild_data[0][2] as bigint;
    }
}
export const setBotChannel = (guild: bigint, channel: bigint) => {
    const db = new DB(filename);
    if(!channelsInitialized) initChannels(db);

    const guild_data = db.query("SELECT * FROM channels WHERE guild=?", [guild]);
    if(guild_data.length == 0) {
        db.query("INSERT INTO channels(guild,channel) VALUES(?,?)", [guild, channel]);
    } else {
        console.log(channel);
        console.log(guild);
        db.query("UPDATE channels SET channel = ? WHERE guild = ?", [channel, guild]);
    }

    db.close();
}

// ---

let schoolsInitialized = false;
const initSchools = (db: DB) => {
    db.query("CREATE TABLE IF NOT EXISTS schools(id INTEGER PRIMARY KEY AUTOINCREMENT, guild INTEGER, name TEXT, category TEXT)");
    channelsInitialized = true;
}

export const getSchoolData = (guild: bigint) : {name: string, category: "junior" | "high"} | undefined => {
    const db = new DB(filename);
    if(!schoolsInitialized) initSchools(db);

    const guild_data = db.query("SELECT * FROM schools WHERE guild=?", [guild]);
    db.close();
    if(guild_data.length == 0) {
        console.warn("学校が登録されていません");
        return undefined;
    } else{
        return {
            name: guild_data[0][2] as string,
            category: guild_data[0][3] as "junior" | "high",
        };
    }
}
export const setSchoolData = (guild: bigint, name: string, category: "junior" | "high") => {
    const db = new DB(filename);
    if(!schoolsInitialized) initSchools(db);

    const guild_data = db.query("SELECT * FROM schools WHERE guild=?", [guild]);
    if(guild_data.length == 0) {
        db.query("INSERT INTO schools(guild,name,category) VALUES(?,?,?)", [guild, name, category]);
    } else {
        db.query("UPDATE schools SET name = ?, category = ? WHERE guild = ?", [name, category, guild]);
    }

    db.close();
}

// ---

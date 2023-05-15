import {BigString, DB} from "../deps.ts";

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
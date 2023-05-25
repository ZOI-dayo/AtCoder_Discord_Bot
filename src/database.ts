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
    schoolsInitialized = true;
}

export const getSchoolData = (guild: bigint) : {name: string, category: "junior" | "high"} | undefined => {
  const db = new DB(filename);
  if(!schoolsInitialized) initSchools(db);

  const guild_data = db.query("SELECT * FROM schools WHERE guild=?", [guild]);
  db.close();
  console.log(guild)
  console.log(guild_data)
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

let ajlInitialized = false;
const initAJL = (db: DB) => {
  db.query("CREATE TABLE IF NOT EXISTS ajl(id INTEGER PRIMARY KEY AUTOINCREMENT, school TEXT, category TEXT, rank INTEGER, hash TEXT)");
  ajlInitialized = true;
}

export const getAJLHash = (schoolName: string, category: "junior" | "high") : {rank: number, hash:string} | undefined => {
  const db = new DB(filename);
  if(!ajlInitialized) initAJL(db);

  const db_data = db.query("SELECT * FROM ajl WHERE school=? AND category=?", [schoolName, category]);
  db.close();
  if(db_data.length == 0) {
    console.warn("レートが記録されていません");
    return undefined;
  } else {
    return {rank: db_data[0][3] as number, hash: db_data[0][4] as string};
  }
}
export const setAJLRank = (schoolName: string, category: "junior" | "high", rank: number, hash: string) => {
  const db = new DB(filename);
  if(!ajlInitialized) initAJL(db);

  const db_data = db.query("SELECT * FROM ajl WHERE school=? AND category=?", [schoolName, category]);
  if(db_data.length == 0) {
    db.query("INSERT INTO ajl(school,category,rank,hash) VALUES(?,?,?,?)", [schoolName, category,rank,hash]);
  } else {
    db.query("UPDATE ajl SET rank = ?, hash = ? WHERE school = ? AND category = ?", [rank, hash, schoolName, category]);
  }

  db.close();
}

// ---

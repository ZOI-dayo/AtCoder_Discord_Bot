export const MINUTE = 1000 * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;

export type TimeDelta = {
  minute?: number | undefined;
  hour?: number | undefined;
};

export class DateTime {
  data = 0;
  offset = 0;
  constructor(data: number) {
    this.data = data;
    this.offset = 9;
  }
  static now() {
    return new DateTime(Date.now());
  }
  static from(str: string) {
    return new DateTime(Date.parse(str));
  }
  get localData() {
    return this.data + this.localOffset;
  }
  get localOffset() {
    return HOUR * this.offset;
  }
  startOfDay() {
    return new DateTime(
      Math.floor(this.localData / DAY) * DAY - this.offset * HOUR,
    );
  }
  add(obj: TimeDelta) {
    return new DateTime(this.data + DateTime.deltaToMillisec(obj));
  }
  static distanse(from: number, to: number) {
    return to - from;
  }
  static deltaToMillisec(delta: TimeDelta) {
    let result = 0;
    if (delta.minute !== undefined) result += delta.minute * MINUTE;
    if (delta.hour !== undefined) result += delta.hour * HOUR;
    return result;
  }
  distanseFromNow() {
    return DateTime.distanse(Date.now(), this.data);
  }
  format(pattern: string) {
    return pattern
      .replaceAll("yyyy", this.year.toString().padStart(2, "0"))
      .replaceAll("MM", this.month.toString().padStart(2, "0"))
      .replaceAll("dd", this.date.toString().padStart(2, "0"))
      .replaceAll("HH", this.hour.toString().padStart(2, "0"))
      .replaceAll("mm", this.minute.toString().padStart(2, "0"));
  }
  get year() {
    return new Date(this.localData).getUTCFullYear();
  }
  get month() {
    return new Date(this.localData).getUTCMonth() + 1;
  }
  get date() {
    return new Date(this.localData).getUTCDate();
  }
  get hour() {
    return Math.floor(this.localData / HOUR) % 24;
  }
  get minute() {
    return Math.floor(this.localData / MINUTE) % 60;
  }

  static registerEvent(callback: () => void, datetime: DateTime) {
    setTimeout(callback, datetime.distanseFromNow());
  }
  static registerScheduledIntervalEvent(
    callback: () => void,
    begin: DateTime,
    interval: number,
  ) {
    console.log(`イベントを${begin.format("yyyy/MM/dd HH:mm")}に予約しました`);
    const run = () => {
      try {
      callback();
      } catch(e) {
        console.error(e);
      }
      setTimeout(run, interval);
      // console.log(`次の${run}の実行は${new DateTime(DateTime.now().data + interval).format("yyyy/MM/dd HH:mm")}`)
    };
    // console.log(`初回実行は${begin.distanseFromNow()}ms後です`);
    setTimeout(run, begin.distanseFromNow());
  }
  static registerIntervalEvent(callback: () => void, interval: number) {
    DateTime.registerScheduledIntervalEvent(
      callback,
      new DateTime(Math.floor(Date.now() / interval) * interval),
      interval,
    );
  }

  // monthやyearなど間隔が変動するものに対してはバグる、WEEK以下の単位じゃないとダメ
  static nextInterval(content: TimeDelta, interval: number) {
    return new DateTime(
      Math.ceil(
            (DateTime.now().localData - DateTime.deltaToMillisec(content)) /
              interval,
          ) * interval -
        DateTime.now().localOffset + DateTime.deltaToMillisec(content),
    );
  }
}

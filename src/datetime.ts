const MINUTE = 1000 * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export class DateTime {
  data = 0;
  offset = 0;
  constructor(data: string | number) {
    if (typeof data === "string") {
      this.data = Date.parse(data);
    } else if (typeof data === "number") {
      this.data = data;
    }
    this.offset = 9;
  }
  get localData() {
    return this.data + HOUR * this.offset;
  }
  startOfDay() {
    return new DateTime(Math.floor(this.localData / DAY) * DAY - this.offset * HOUR);
  }
  add(obj: { minute?: number | undefined; hour?: number | undefined }) {
    let new_data = this.data;
    if (obj.minute !== undefined) new_data += obj.minute * MINUTE;
    if (obj.hour !== undefined) new_data += obj.hour * HOUR;
    // 他は略
    return new DateTime(new_data);
  }
  static distanse(from: number, to: number) {
    return to - from;
  }
  distanseFromNow() {
    return DateTime.distanse(Date.now(), this.data);
  }
  format(pattern: string) {
    return pattern
      .replaceAll("mm", this.minute.toString().padStart(2, "0"))
      .replaceAll("HH", this.hour.toString().padStart(2, "0"));
  }
  get hour() {
    return Math.floor(this.localData / HOUR) % 24;
  }
  get minute() {
    return Math.floor(this.localData / MINUTE) % 60;
  }
}

const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;

export class DateTime {
  constructor(str: string) {
    this.data = Date.parse(str);
    this.offset = 9;
  }
  locateTime() {
    return this.data + HOUR * this.offset;
  }
  startOfDay() {
    return Math.floor(this.locateTime() / DAY) * DAY;
  }
  add(obj: {hour?: number | undefined}) {
    if(hour !== nudefined) this.data += hour * HOUR;
    // 他は略
  }
  static distanse(from: number, to: number) {
    return to - from;
  }
  distanseFromNow() {
    return super.distanse(Date.now(), this.data);
  }
}
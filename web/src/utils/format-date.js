import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

export function format(date) {
  dayjs.extend(relativeTime);
  return dayjs(Number(date)).fromNow();
}

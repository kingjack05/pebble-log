import { range } from "./utils";
import { format } from "date-fns";

export function getDatesBetween(from: Date, to: Date) {
  const diffInMilliseconds = Math.abs(to.getTime() - from.getTime());
  const msInDay = 1000 * 60 * 60 * 24;
  const diffInDays = Math.floor(diffInMilliseconds / msInDay);
  return range(0, diffInDays + 1).map((i) => {
    const day = new Date(from);
    day.setDate(day.getDate() + i);
    return day;
  });
}

/**
 * format date to string in the format yyyy-MM-dd in localTime
 */
export function getDateStr(date: Date) {
  return format(date, "yyyy-MM-dd");
}

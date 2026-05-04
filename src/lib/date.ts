import {
  addDays,
  differenceInCalendarDays,
  format,
  parse,
  startOfYear,
  subDays,
} from "date-fns";
import type { HabitFrequency } from "../types";

export function getDateKey(date = new Date()) {
  return format(date, "yyyy-MM-dd");
}

export function parseDateKey(dateKey: string) {
  return parse(dateKey, "yyyy-MM-dd", new Date());
}

export function formatLongDate(date = new Date()) {
  return format(date, "EEEE, d MMMM yyyy");
}

export function pickDailyItem<T>(items: T[], offset = 0, date = new Date()) {
  const index =
    (differenceInCalendarDays(date, startOfYear(date)) + offset) % items.length;
  return items[index];
}

export function getGreetingLabel(name: string, date = new Date()) {
  const firstName = name.trim().split(" ")[0] ?? name;
  const hour = date.getHours();

  if (hour < 12) {
    return `Assalamu alaikum, ${firstName}`;
  }

  if (hour < 18) {
    return `Bismillah, ${firstName}`;
  }

  return `Peace for the evening, ${firstName}`;
}

export function habitRunsOnDate(frequency: HabitFrequency, date: Date) {
  const day = date.getDay();

  if (frequency === "daily") {
    return true;
  }

  if (frequency === "weekdays") {
    return day >= 1 && day <= 5;
  }

  return day === 0 || day === 6;
}

export function calculateSleepHours(bedtime: string, wakeTime: string) {
  const [bedHour, bedMinute] = bedtime.split(":").map(Number);
  const [wakeHour, wakeMinute] = wakeTime.split(":").map(Number);

  const bedTotal = bedHour * 60 + bedMinute;
  let wakeTotal = wakeHour * 60 + wakeMinute;

  if (wakeTotal <= bedTotal) {
    wakeTotal += 24 * 60;
  }

  const duration = wakeTotal - bedTotal;
  return Math.round((duration / 60) * 10) / 10;
}

export function listDates(days: number, date = new Date()) {
  return Array.from({ length: days }, (_, index) =>
    subDays(date, days - index - 1),
  );
}

export function addCalendarDays(date: Date, amount: number) {
  return addDays(date, amount);
}

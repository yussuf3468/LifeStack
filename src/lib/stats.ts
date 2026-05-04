import { format, startOfWeek, subDays } from "date-fns";
import {
  DHIKR_GOAL,
  FOCUS_SLOTS,
  MOOD_OPTIONS,
  PRAYER_SLOTS,
  WATER_GOAL,
} from "../data/content";
import {
  addCalendarDays,
  getDateKey,
  habitRunsOnDate,
  listDates,
  parseDateKey,
} from "./date";
import type { AppState, DailyEntry, Habit, MoodValue } from "../types";
import type { PrayerName } from "../types";

export interface XpState {
  current: number;
  max: number;
  percent: number;
  completedCount: number;
  totalCount: number;
  level: string;
}

export interface HeatmapCell {
  key: string;
  label: string;
  scheduled: boolean;
  done: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export interface HeatmapColumn {
  label: string;
  days: HeatmapCell[];
}

export interface HabitStreak {
  current: number;
  longest: number;
}

export interface PrayerHistoryRow {
  dateKey: string;
  label: string;
  logged: boolean;
  protectedCount: number;
  missed: PrayerName[];
}

export interface PrayerAverageRow {
  id: PrayerName;
  label: string;
  protectedDays: number;
  loggedDays: number;
  missedDays: number;
  percent: number;
}

const focusSlotCount = FOCUS_SLOTS.length;
const prayerSlotCount = PRAYER_SLOTS.length;

const moodLookup = Object.fromEntries(
  MOOD_OPTIONS.map((option) => [option.value, option]),
) as Record<MoodValue, (typeof MOOD_OPTIONS)[number]>;

export function getActiveHabits(habits: Habit[], date = new Date()) {
  return habits
    .filter((habit) => habitRunsOnDate(habit.frequency, date))
    .slice(0, 8);
}

export function getXpState(state: AppState, date = new Date()): XpState {
  const activeHabits = getActiveHabits(state.habits, date);
  const entry = state.daily[getDateKey(date)];
  const completedCount = activeHabits.filter((habit) =>
    entry?.completedHabitIds.includes(habit.id),
  ).length;
  const focusCompleted =
    entry?.focusItems?.filter((item) => item.done).length ?? 0;
  const prayersOnTime =
    entry?.prayers?.filter((item) => item.onTime).length ?? 0;
  const dhikrProgress = Math.min(entry?.dhikrCount ?? 0, DHIKR_GOAL);
  const quranStudyXp = entry?.quranStudyDone ? 14 : 0;
  const waterProgress = Math.min(entry?.waterCups ?? 0, WATER_GOAL);
  const notesXp =
    (entry?.reflection?.trim() ? 6 : 0) + (entry?.dua?.trim() ? 6 : 0);

  const current =
    completedCount * 12 +
    (entry?.mood ? 16 : 0) +
    (entry?.sleep ? 20 : 0) +
    focusCompleted * 8 +
    prayersOnTime * 8 +
    Math.round(dhikrProgress / 10) +
    quranStudyXp +
    waterProgress +
    (entry?.energy ? 10 : 0) +
    notesXp;
  const max =
    activeHabits.length * 12 +
    16 +
    20 +
    focusSlotCount * 8 +
    prayerSlotCount * 8 +
    10 +
    14 +
    WATER_GOAL +
    10 +
    12;
  const percent = max === 0 ? 0 : Math.round((current / max) * 100);

  let level = "Warm-up";

  if (percent >= 100) {
    level = "Ihsan mode";
  } else if (percent >= 75) {
    level = "Deep flow";
  } else if (percent >= 45) {
    level = "Locked in";
  }

  return {
    current,
    max,
    percent,
    completedCount,
    totalCount: activeHabits.length,
    level,
  };
}

export function getAveragePrayerCompletion(
  daily: Record<string, DailyEntry>,
  days = 14,
  today = new Date(),
) {
  const values = listDates(days, today).map(
    (date) =>
      daily[getDateKey(date)]?.prayers?.filter((item) => item.onTime).length ??
      0,
  );

  if (values.every((value) => value === 0)) {
    return 0;
  }

  return (
    Math.round(
      (values.reduce((sum, value) => sum + value, 0) / values.length) * 10,
    ) / 10
  );
}

export function getPrayerHistory(
  daily: Record<string, DailyEntry>,
  days = 30,
  today = new Date(),
): PrayerHistoryRow[] {
  return listDates(days, today)
    .map((date) => {
      const dateKey = getDateKey(date);
      const entry = daily[dateKey];
      const prayers = entry?.prayers;
      const logged = Array.isArray(prayers);
      const missed = logged
        ? PRAYER_SLOTS.filter(
            (slot) =>
              !prayers.some((prayer) => prayer.id === slot.id && prayer.onTime),
          ).map((slot) => slot.id)
        : [];

      return {
        dateKey,
        label: format(date, "EEE, d MMM"),
        logged,
        protectedCount: logged ? prayerSlotCount - missed.length : 0,
        missed,
      };
    })
    .reverse();
}

export function getPrayerAveragesByPrayer(
  daily: Record<string, DailyEntry>,
  days = 30,
  today = new Date(),
): PrayerAverageRow[] {
  const rows = listDates(days, today).map((date) => daily[getDateKey(date)]);

  return PRAYER_SLOTS.map((slot) => {
    let protectedDays = 0;
    let loggedDays = 0;

    for (const entry of rows) {
      if (!entry?.prayers) {
        continue;
      }

      loggedDays += 1;

      if (
        entry.prayers.some((prayer) => prayer.id === slot.id && prayer.onTime)
      ) {
        protectedDays += 1;
      }
    }

    return {
      id: slot.id,
      label: slot.label,
      protectedDays,
      loggedDays,
      missedDays: loggedDays - protectedDays,
      percent:
        loggedDays === 0 ? 0 : Math.round((protectedDays / loggedDays) * 100),
    };
  });
}

export function getAverageDhikr(
  daily: Record<string, DailyEntry>,
  days = 14,
  today = new Date(),
) {
  const values = listDates(days, today).map(
    (date) => daily[getDateKey(date)]?.dhikrCount ?? 0,
  );

  if (values.every((value) => value === 0)) {
    return 0;
  }

  return (
    Math.round(
      (values.reduce((sum, value) => sum + value, 0) / values.length) * 10,
    ) / 10
  );
}

export function getQuranStudyDays(
  daily: Record<string, DailyEntry>,
  days = 14,
  today = new Date(),
) {
  return listDates(days, today).filter(
    (date) => daily[getDateKey(date)]?.quranStudyDone,
  ).length;
}

export function getAverageWater(
  daily: Record<string, DailyEntry>,
  days = 14,
  today = new Date(),
) {
  const values = listDates(days, today).map(
    (date) => daily[getDateKey(date)]?.waterCups ?? 0,
  );

  if (values.every((value) => value === 0)) {
    return 0;
  }

  return (
    Math.round(
      (values.reduce((sum, value) => sum + value, 0) / values.length) * 10,
    ) / 10
  );
}

export function getAverageFocusCompletion(
  daily: Record<string, DailyEntry>,
  days = 14,
  today = new Date(),
) {
  const values = listDates(days, today).map((date) => {
    const completed =
      daily[getDateKey(date)]?.focusItems?.filter((item) => item.done).length ??
      0;
    return Math.round((completed / focusSlotCount) * 100);
  });

  if (values.every((value) => value === 0)) {
    return 0;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

export function getJournalDays(
  daily: Record<string, DailyEntry>,
  days = 14,
  today = new Date(),
) {
  return listDates(days, today).filter((date) => {
    const entry = daily[getDateKey(date)];
    return Boolean(entry?.reflection?.trim() || entry?.dua?.trim());
  }).length;
}

export function getSleepAverage(
  daily: Record<string, DailyEntry>,
  days = 14,
  today = new Date(),
) {
  const relevant = listDates(days, today)
    .map((date) => daily[getDateKey(date)]?.sleep?.hours)
    .filter((value): value is number => typeof value === "number");

  if (relevant.length === 0) {
    return 0;
  }

  return (
    Math.round(
      (relevant.reduce((sum, value) => sum + value, 0) / relevant.length) * 10,
    ) / 10
  );
}

export function getMoodTrend(
  daily: Record<string, DailyEntry>,
  days = 14,
  today = new Date(),
) {
  return listDates(days, today)
    .map((date) => {
      const mood = daily[getDateKey(date)]?.mood;

      if (!mood) {
        return null;
      }

      return {
        date: format(date, "MMM d"),
        mood: moodLookup[mood].score,
        label: moodLookup[mood].label,
      };
    })
    .filter((entry): entry is { date: string; mood: number; label: string } =>
      Boolean(entry),
    );
}

export function getMoodAverage(
  daily: Record<string, DailyEntry>,
  days = 14,
  today = new Date(),
) {
  const trend = getMoodTrend(daily, days, today);

  if (trend.length === 0) {
    return 0;
  }

  return (
    Math.round(
      (trend.reduce((sum, item) => sum + item.mood, 0) / trend.length) * 10,
    ) / 10
  );
}

export function getHabitStreak(
  habit: Habit,
  daily: Record<string, DailyEntry>,
  today = new Date(),
): HabitStreak {
  const startDate = parseDateKey(getDateKey(new Date(habit.createdAt)));
  let cursor = startDate;
  let running = 0;
  let longest = 0;

  while (cursor <= today) {
    if (habitRunsOnDate(habit.frequency, cursor)) {
      const done =
        daily[getDateKey(cursor)]?.completedHabitIds.includes(habit.id) ??
        false;
      running = done ? running + 1 : 0;
      longest = Math.max(longest, running);
    }

    cursor = addCalendarDays(cursor, 1);
  }

  let current = 0;
  let reverseCursor = today;

  while (reverseCursor >= startDate) {
    if (!habitRunsOnDate(habit.frequency, reverseCursor)) {
      reverseCursor = subDays(reverseCursor, 1);
      continue;
    }

    const done =
      daily[getDateKey(reverseCursor)]?.completedHabitIds.includes(habit.id) ??
      false;

    if (!done) {
      break;
    }

    current += 1;
    reverseCursor = subDays(reverseCursor, 1);
  }

  return { current, longest };
}

export function getHabitCompletionRate(
  habit: Habit,
  daily: Record<string, DailyEntry>,
  days = 56,
  today = new Date(),
) {
  let scheduledDays = 0;
  let doneDays = 0;

  for (const date of listDates(days, today)) {
    if (!habitRunsOnDate(habit.frequency, date)) {
      continue;
    }

    scheduledDays += 1;

    if (daily[getDateKey(date)]?.completedHabitIds.includes(habit.id)) {
      doneDays += 1;
    }
  }

  if (scheduledDays === 0) {
    return 0;
  }

  return Math.round((doneDays / scheduledDays) * 100);
}

export function getHeatmapColumns(
  habit: Habit,
  daily: Record<string, DailyEntry>,
  weeks = 8,
  today = new Date(),
): HeatmapColumn[] {
  const start = startOfWeek(subDays(today, weeks * 7 - 1), { weekStartsOn: 1 });
  const columns: HeatmapColumn[] = [];

  for (let weekIndex = 0; weekIndex < weeks; weekIndex += 1) {
    const weekStart = addCalendarDays(start, weekIndex * 7);

    columns.push({
      label: format(weekStart, "MMM"),
      days: Array.from({ length: 7 }, (_, dayIndex) => {
        const date = addCalendarDays(weekStart, dayIndex);
        const key = getDateKey(date);
        const scheduled = habitRunsOnDate(habit.frequency, date);
        const done = daily[key]?.completedHabitIds.includes(habit.id) ?? false;
        const isFuture = date > today;

        return {
          key,
          label: format(date, "EEE, d MMM"),
          scheduled,
          done,
          isToday: key === getDateKey(today),
          isFuture,
        };
      }),
    });
  }

  return columns;
}

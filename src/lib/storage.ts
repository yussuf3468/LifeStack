import {
  DHIKR_GOAL,
  PRAYER_SLOTS,
  STARTER_HABIT_TEMPLATES,
} from "../data/content";
import type {
  AppState,
  AddictionTracker,
  DailyEntry,
  DailyFocusItem,
  DailyPrayerItem,
  EnergyValue,
  Habit,
  HabitFrequency,
  MoodValue,
  PrayerName,
  Profile,
} from "../types";

const STORAGE_KEY = "lifestack.v1";

export function getStorageKey(userId?: string | null) {
  return userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY;
}

function slugifyHabitLabel(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function createHabitId(label: string, index: number) {
  const slug = slugifyHabitLabel(label);
  return slug ? `starter-${slug}` : `starter-habit-${index + 1}`;
}

function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function createDefaultState(): AppState {
  const timestamp = new Date().toISOString();

  return {
    profile: {
      name: "Yussuf Hassan",
      faith: "Muslim",
      timezone: getTimezone(),
    },
    habits: STARTER_HABIT_TEMPLATES.map((habit, index) => ({
      id: createHabitId(habit.label, index),
      createdAt: timestamp,
      ...habit,
    })),
    daily: {},
    addictionTracker: {
      cleanSince: timestamp,
      started: false,
      relapses: [],
      urges: [],
    },
    updatedAt: timestamp,
  };
}

function isStarterHabitLabel(label: string) {
  return STARTER_HABIT_TEMPLATES.some((habit) => habit.label === label);
}

function migrateStarterHabitIds(state: AppState) {
  const idMap = new Map<string, string>();

  const habits = state.habits.map((habit, index) => {
    if (!isStarterHabitLabel(habit.label)) {
      return habit;
    }

    const stableId = createHabitId(habit.label, index);

    if (habit.id !== stableId) {
      idMap.set(habit.id, stableId);
    }

    return {
      ...habit,
      id: stableId,
    };
  });

  if (idMap.size === 0) {
    return state;
  }

  const daily = Object.fromEntries(
    Object.entries(state.daily).map(([dateKey, entry]) => [
      dateKey,
      {
        ...entry,
        completedHabitIds: entry.completedHabitIds.map(
          (habitId) => idMap.get(habitId) ?? habitId,
        ),
      },
    ]),
  );

  return {
    ...state,
    habits,
    daily,
  };
}

function isFrequency(value: unknown): value is HabitFrequency {
  return value === "daily" || value === "weekdays" || value === "weekends";
}

function isMood(value: unknown): value is MoodValue {
  return (
    value === "awful" ||
    value === "bad" ||
    value === "meh" ||
    value === "good" ||
    value === "great"
  );
}

function isEnergy(value: unknown): value is EnergyValue {
  return value === "drained" || value === "steady" || value === "sharp";
}

function isPrayer(value: unknown): value is PrayerName {
  return (
    value === "fajr" ||
    value === "dhuhr" ||
    value === "asr" ||
    value === "maghrib" ||
    value === "isha"
  );
}

function normalizeFocusItems(value: unknown): DailyFocusItem[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const focusItems = value
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const candidate = item as Partial<DailyFocusItem>;

      if (typeof candidate.id !== "string") {
        return null;
      }

      return {
        id: candidate.id,
        text: typeof candidate.text === "string" ? candidate.text : "",
        done: Boolean(candidate.done),
      };
    })
    .filter((item): item is DailyFocusItem => Boolean(item))
    .slice(0, 3);

  return focusItems.length > 0 ? focusItems : undefined;
}

function normalizePrayers(value: unknown): DailyPrayerItem[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const prayers = value
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const candidate = item as Partial<DailyPrayerItem>;

      if (!isPrayer(candidate.id)) {
        return null;
      }

      return {
        id: candidate.id,
        onTime: Boolean(candidate.onTime),
      };
    })
    .filter((item): item is DailyPrayerItem => Boolean(item))
    .slice(0, PRAYER_SLOTS.length);

  return prayers.length > 0 ? prayers : undefined;
}

function normalizeProfile(value: unknown, fallback: Profile): Profile {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const candidate = value as Partial<Profile>;

  return {
    name:
      typeof candidate.name === "string" && candidate.name.trim()
        ? candidate.name
        : fallback.name,
    faith:
      typeof candidate.faith === "string" && candidate.faith.trim()
        ? candidate.faith
        : fallback.faith,
    timezone:
      typeof candidate.timezone === "string" && candidate.timezone.trim()
        ? candidate.timezone
        : fallback.timezone,
  };
}

function normalizeHabits(value: unknown, fallback: Habit[]): Habit[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const habits = value
    .filter((habit) => habit && typeof habit === "object")
    .map((habit, index) => {
      const candidate = habit as Partial<Habit>;

      if (
        typeof candidate.id !== "string" ||
        typeof candidate.label !== "string" ||
        typeof candidate.icon !== "string" ||
        !isFrequency(candidate.frequency)
      ) {
        return null;
      }

      return {
        id: candidate.id,
        label: candidate.label,
        icon: candidate.icon,
        frequency: candidate.frequency,
        accent:
          typeof candidate.accent === "string"
            ? candidate.accent
            : (fallback[index % fallback.length]?.accent ?? "#2f8a67"),
        createdAt:
          typeof candidate.createdAt === "string" && candidate.createdAt.trim()
            ? candidate.createdAt
            : new Date().toISOString(),
      };
    })
    .filter((habit): habit is Habit => Boolean(habit))
    .slice(0, 8);

  return habits.length > 0 ? habits : fallback;
}

function normalizeDaily(value: unknown): Record<string, DailyEntry> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const output: Record<string, DailyEntry> = {};

  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const candidate = entry as Partial<DailyEntry>;
    const sleep = candidate.sleep;
    const dhikrCount =
      typeof candidate.dhikrCount === "number"
        ? Math.max(0, Math.min(DHIKR_GOAL, Math.round(candidate.dhikrCount)))
        : undefined;
    const waterCups =
      typeof candidate.waterCups === "number"
        ? Math.max(0, Math.min(8, Math.round(candidate.waterCups)))
        : undefined;

    output[key] = {
      date: typeof candidate.date === "string" ? candidate.date : key,
      completedHabitIds: Array.isArray(candidate.completedHabitIds)
        ? candidate.completedHabitIds.filter(
            (habitId): habitId is string => typeof habitId === "string",
          )
        : [],
      mood: isMood(candidate.mood) ? candidate.mood : undefined,
      sleep:
        sleep &&
        typeof sleep === "object" &&
        typeof sleep.bedtime === "string" &&
        typeof sleep.wakeTime === "string" &&
        typeof sleep.hours === "number"
          ? sleep
          : undefined,
      energy: isEnergy(candidate.energy) ? candidate.energy : undefined,
      prayers: normalizePrayers(candidate.prayers),
      dhikrCount,
      quranStudyDone: Boolean(candidate.quranStudyDone),
      waterCups,
      focusItems: normalizeFocusItems(candidate.focusItems),
      reflection:
        typeof candidate.reflection === "string" ? candidate.reflection : "",
      dua: typeof candidate.dua === "string" ? candidate.dua : "",
    };
  }

  return output;
}

function normalizeAddictionTracker(
  value: unknown,
  fallback: AddictionTracker,
): AddictionTracker {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const candidate = value as Partial<AddictionTracker>;
  const hasActivity =
    (Array.isArray(candidate.relapses) && candidate.relapses.length > 0) ||
    (Array.isArray(candidate.urges) && candidate.urges.length > 0);

  return {
    cleanSince:
      typeof candidate.cleanSince === "string" && candidate.cleanSince.trim()
        ? candidate.cleanSince
        : fallback.cleanSince,
    started:
      typeof candidate.started === "boolean" ? candidate.started : hasActivity,
    relapses: Array.isArray(candidate.relapses)
      ? candidate.relapses
          .filter(
            (r) => r && typeof r === "object" && typeof r.date === "string",
          )
          .map((r) => ({
            date: r.date,
            note: typeof r.note === "string" ? r.note : undefined,
          }))
      : [],
    urges: Array.isArray(candidate.urges)
      ? candidate.urges.filter((u): u is string => typeof u === "string")
      : [],
  };
}

export function hydrateState(value: unknown): AppState {
  const fallback = createDefaultState();

  if (!value || typeof value !== "object") {
    return fallback;
  }

  const candidate = value as Partial<AppState>;

  const hydrated = {
    profile: normalizeProfile(candidate.profile, fallback.profile),
    habits: normalizeHabits(candidate.habits, fallback.habits),
    daily: normalizeDaily(candidate.daily),
    addictionTracker: normalizeAddictionTracker(
      candidate.addictionTracker,
      fallback.addictionTracker,
    ),
    updatedAt:
      typeof candidate.updatedAt === "string" && candidate.updatedAt.trim()
        ? candidate.updatedAt
        : fallback.updatedAt,
  };

  return migrateStarterHabitIds(hydrated);
}

export function loadState(storageKey = getStorageKey()) {
  const storedState = loadStoredState(storageKey);

  return storedState ?? createDefaultState();
}

export function loadStoredState(storageKey = getStorageKey()) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawState = window.localStorage.getItem(storageKey);

    if (!rawState) {
      return null;
    }

    return hydrateState(JSON.parse(rawState));
  } catch {
    return null;
  }
}

export function saveState(state: AppState, storageKey = getStorageKey()) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

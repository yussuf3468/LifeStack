export type HabitFrequency = "daily" | "weekdays" | "weekends";

export type MoodValue = "awful" | "bad" | "meh" | "good" | "great";

export type EnergyValue = "drained" | "steady" | "sharp";

export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface Habit {
  id: string;
  label: string;
  icon: string;
  frequency: HabitFrequency;
  accent: string;
  createdAt: string;
}

export interface HabitInput {
  id?: string;
  label: string;
  icon: string;
  frequency: HabitFrequency;
  accent: string;
}

export interface SleepLog {
  bedtime: string;
  wakeTime: string;
  hours: number;
}

export interface DailyFocusItem {
  id: string;
  text: string;
  done: boolean;
}

export interface DailyPrayerItem {
  id: PrayerName;
  onTime: boolean;
}

export interface DailyEntry {
  date: string;
  completedHabitIds: string[];
  mood?: MoodValue;
  sleep?: SleepLog;
  energy?: EnergyValue;
  prayers?: DailyPrayerItem[];
  dhikrCount?: number;
  quranStudyDone?: boolean;
  waterCups?: number;
  focusItems?: DailyFocusItem[];
  reflection?: string;
  dua?: string;
}

export interface Profile {
  name: string;
  faith: string;
  timezone: string;
}

export interface AppState {
  profile: Profile;
  habits: Habit[];
  daily: Record<string, DailyEntry>;
  updatedAt: string;
}

export interface MoodOption {
  value: MoodValue;
  emoji: string;
  label: string;
  score: number;
  tone: string;
}

export interface EnergyOption {
  value: EnergyValue;
  emoji: string;
  label: string;
  cue: string;
}

export interface Preset {
  value: string;
  label: string;
}

export interface FocusSlot {
  id: string;
  label: string;
  placeholder: string;
}

export interface PrayerSlot {
  id: PrayerName;
  label: string;
  cue: string;
}

export interface HabitTemplate {
  label: string;
  icon: string;
  frequency: HabitFrequency;
  accent: string;
}

export interface MicroQuote {
  text: string;
  author: string;
}

export interface VerseCard {
  reference: string;
  arabic: string;
  translation: string;
  reflection: string;
}

export interface QuranStudyPage {
  page: number;
  surah: string;
  arabic: string;
  translation: string;
  tafsir: string;
  practice: string;
}

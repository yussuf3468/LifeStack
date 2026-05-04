import { Link } from "react-router-dom";
import type {
  DailyEntry,
  EnergyOption,
  FocusSlot,
  Habit,
  MoodOption,
  Preset,
  Profile,
  PrayerSlot,
  QuranStudyPage,
  VerseCard,
  MicroQuote,
} from "../types";
import type { XpState } from "../lib/stats";

interface HomeScreenProps {
  profile: Profile;
  greeting: string;
  longDate: string;
  quote: MicroQuote;
  verse: VerseCard;
  quranStudy: QuranStudyPage;
  focusPrompt: string;
  backendLabel: string;
  activeHabits: Habit[];
  todayEntry: DailyEntry;
  xp: XpState;
  energyOptions: EnergyOption[];
  focusSlots: FocusSlot[];
  prayerSlots: PrayerSlot[];
  dhikrGoal: number;
  dhikrQuickSteps: number[];
  waterGoal: number;
  bedtimePresets: Preset[];
  wakeTimePresets: Preset[];
  currentBedtime: string;
  currentWakeTime: string;
  moodOptions: MoodOption[];
  onEnergyChange: (value: EnergyOption["value"]) => void;
  onTogglePrayer: (prayerId: PrayerSlot["id"]) => void;
  onAdjustDhikr: (delta: number) => void;
  onResetDhikr: () => void;
  onToggleQuranStudy: () => void;
  onWaterCupsChange: (value: number) => void;
  onFocusItemTextChange: (focusId: string, text: string) => void;
  onToggleFocusItem: (focusId: string) => void;
  onDailyNoteChange: (field: "reflection" | "dua", value: string) => void;
  onToggleHabit: (habitId: string) => void;
  onMoodChange: (mood: MoodOption["value"]) => void;
  onSleepSelection: (kind: "bedtime" | "wakeTime", value: string) => void;
  onClearSleep: () => void;
}

function findHabitByKeywords(habits: Habit[], keywords: string[]) {
  return habits.find((habit) => {
    const normalizedLabel = habit.label.toLowerCase();
    return keywords.some((keyword) => normalizedLabel.includes(keyword));
  });
}

export function HomeScreen({
  greeting,
  longDate,
  quote,
  verse,
  quranStudy,
  focusPrompt,
  backendLabel,
  activeHabits,
  todayEntry,
  xp,
  energyOptions,
  focusSlots,
  prayerSlots,
  dhikrGoal,
  dhikrQuickSteps,
  waterGoal,
  bedtimePresets,
  wakeTimePresets,
  currentBedtime,
  currentWakeTime,
  moodOptions,
  onEnergyChange,
  onTogglePrayer,
  onAdjustDhikr,
  onResetDhikr,
  onToggleQuranStudy,
  onWaterCupsChange,
  onFocusItemTextChange,
  onToggleFocusItem,
  onDailyNoteChange,
  onToggleHabit,
  onMoodChange,
  onSleepSelection,
  onClearSleep,
}: HomeScreenProps) {
  const mood = moodOptions.find((option) => option.value === todayEntry.mood);
  const energy = energyOptions.find(
    (option) => option.value === todayEntry.energy,
  );
  const focusItems = focusSlots.map((slot) => {
    const item = todayEntry.focusItems?.find(
      (focusItem) => focusItem.id === slot.id,
    );

    return {
      ...slot,
      text: item?.text ?? "",
      done: item?.done ?? false,
    };
  });
  const focusDoneCount = focusItems.filter((item) => item.done).length;
  const prayers = prayerSlots.map((slot) => {
    const item = todayEntry.prayers?.find((prayer) => prayer.id === slot.id);

    return {
      ...slot,
      onTime: item?.onTime ?? false,
    };
  });
  const prayerDoneCount = prayers.filter((prayer) => prayer.onTime).length;
  const dhikrCount = todayEntry.dhikrCount ?? 0;
  const dhikrPercent = Math.min(
    100,
    Math.round((dhikrCount / dhikrGoal) * 100),
  );
  const quranStudyDone = Boolean(todayEntry.quranStudyDone);
  const waterCups = todayEntry.waterCups ?? 0;
  const journalReady = Boolean(
    todayEntry.reflection?.trim() || todayEntry.dua?.trim(),
  );
  const completedHabitIds = todayEntry.completedHabitIds;
  const remainingHabits = activeHabits.filter(
    (habit) => !completedHabitIds.includes(habit.id),
  );
  const faithHabit = findHabitByKeywords(activeHabits, [
    "fajr",
    "quran",
    "dhikr",
    "salah",
    "prayer",
    "wird",
  ]);
  const buildHabit = findHabitByKeywords(activeHabits, [
    "deep",
    "study",
    "sprint",
    "code",
    "project",
    "build",
    "debug",
    "lecture",
    "assignment",
  ]);
  const faithDone = faithHabit
    ? completedHabitIds.includes(faithHabit.id)
    : false;
  const buildDone = buildHabit
    ? completedHabitIds.includes(buildHabit.id)
    : false;
  const recoveryReady = Boolean(todayEntry.sleep && todayEntry.mood);
  const remainingActions =
    remainingHabits.length +
    (todayEntry.sleep ? 0 : 1) +
    (todayEntry.mood ? 0 : 1);
  const coachHeadline =
    remainingActions === 0
      ? "Clean finish"
      : remainingActions <= 2
        ? "Tight finish"
        : "Stay light and deliberate";
  const coachNote =
    remainingActions === 0
      ? "You closed the daily loop. Protect your energy and leave tomorrow a calmer runway."
      : remainingHabits[0]
        ? `${remainingHabits[0].label} is the highest-leverage tap left. Keep the stack narrow and honest.`
        : focusPrompt;
  const coachSteps = [
    {
      icon: "🕌",
      title: "Ibadah",
      status: faithHabit ? (faithDone ? "Done" : "Pending") : "None set",
      copy: faithHabit
        ? faithDone
          ? `${faithHabit.label} is already protected today.`
          : `Start with ${faithHabit.label} before the rest of the day pulls you wide.`
        : "No dedicated faith habit is scheduled today. Let the Quran spark set the tone.",
    },
    {
      icon: "💻",
      title: "Work",
      status: buildHabit ? (buildDone ? "Done" : "Pending") : "Flexible",
      copy: buildHabit
        ? buildDone
          ? `${buildHabit.label} is already on the board.`
          : `${buildHabit.label} is the cleanest technical win left in the stack.`
        : remainingHabits[0]
          ? `${remainingHabits[0].label} is the next concrete action.`
          : "No build habit is left. Keep your streaks clean and stop there.",
    },
    {
      icon: "🌙",
      title: "Recovery",
      status: recoveryReady
        ? "Logged"
        : todayEntry.sleep || todayEntry.mood
          ? "Partial"
          : "Not logged",
      copy: recoveryReady
        ? `Sleep ${todayEntry.sleep?.hours}h and mood ${mood?.label ?? "logged"} give you a readable baseline.`
        : todayEntry.sleep
          ? "Sleep is logged. Add your mood so the stats tell the truth."
          : "Log sleep and mood so effort does not hide fatigue.",
    },
  ];
  const coachChips = [
    remainingActions === 0
      ? "All done for today"
      : `${remainingActions} ${remainingActions === 1 ? "item" : "items"} left`,
    backendLabel,
  ];

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* ── HERO ───────────────────────────────────────── */}
      <section
        className="rounded-2xl px-5 pt-5 pb-6"
        style={{
          background: "linear-gradient(145deg, #17372c 0%, #1f5a46 85%)",
        }}
      >
        <p className="text-[11px] text-[#6db898] font-bold uppercase tracking-widest mb-2">
          LifeStack
        </p>
        <h1 className="text-[1.65rem] font-black text-white leading-tight tracking-tight">
          {greeting}
        </h1>
        <p className="text-[#6db898] text-sm mt-1">{longDate}</p>
        <blockquote className="mt-4 border-l-2 border-[#d3a74d]/50 pl-3">
          <p className="text-[#f0cb6a] text-[13px] italic leading-snug">
            "{quote.text}"
          </p>
          <cite className="text-[#6db898] text-[11px] not-italic mt-1 block">
            {quote.author}
          </cite>
        </blockquote>
      </section>

      {/* PLACEHOLDER – rest of HomeScreen removed for replacement */}
      <div id="__homecontent__">
        {/* ── XP + STATS ─────────────────────────────────── */}
        <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[11px] text-[#657a71] font-bold uppercase tracking-wider">
                Daily XP
              </p>
              <p className="text-lg font-black text-[#18231f] mt-0.5 leading-tight">
                Level {xp.level}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-[#1f5a46] leading-none">
                {xp.percent}%
              </p>
              <p className="text-[10px] text-[#657a71] mt-0.5">
                {xp.current}/{xp.max} XP
              </p>
            </div>
          </div>
          <div className="h-2 bg-[#f0ede4] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${xp.percent}%`,
                background: "linear-gradient(90deg,#1f5a46,#2f8a67)",
              }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { value: String(xp.completedCount), label: "Habits" },
              {
                value: todayEntry.sleep ? `${todayEntry.sleep.hours}h` : "—",
                label: "Sleep",
              },
              { value: mood ? mood.emoji : "—", label: "Mood" },
              { value: `${prayerDoneCount}/5`, label: "Prayers" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="bg-[#faf5eb] rounded-xl p-2.5 text-center"
              >
                <p className="font-black text-[#18231f] text-sm leading-none">
                  {value}
                </p>
                <p className="text-[10px] text-[#657a71] mt-1">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-black/[0.05] flex items-start gap-2">
            <span className="text-[10px] font-black text-[#d3a74d] uppercase tracking-wider shrink-0 mt-0.5">
              Tip
            </span>
            <p className="text-[12px] text-[#5d6f65] leading-snug">
              {focusPrompt}
            </p>
          </div>
        </section>

        {/* ── HABIT GRID ─────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#18231f] text-base tracking-tight">
              Today's Habits
            </h2>
            <p className="text-[11px] text-[#657a71] mt-0.5">
              Tap each habit to mark it done.
            </p>
          </div>
          <Link
            className="text-[12px] font-semibold text-[#1f5a46] hover:text-[#17372c] transition-colors"
            to="/manager"
          >
            Edit habits →
          </Link>
        </div>

        {activeHabits.length > 0 ? (
          <section className="grid grid-cols-2 gap-2.5">
            {activeHabits.map((habit) => {
              const isDone = todayEntry.completedHabitIds.includes(habit.id);
              return (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => onToggleHabit(habit.id)}
                  className={[
                    "flex flex-col items-start gap-1.5 p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.96]",
                    isDone
                      ? "bg-[#17372c] border-[#17372c]"
                      : "bg-white border-black/[0.07] hover:border-[#1f5a46]/40",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xl" aria-hidden="true">
                      {habit.icon}
                    </span>
                    <span
                      className={[
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-lg",
                        isDone
                          ? "bg-[#f0cb6a]/20 text-[#f0cb6a]"
                          : "bg-[#f0ede4] text-[#657a71]",
                      ].join(" ")}
                    >
                      {isDone ? "✓ Done" : "Tap"}
                    </span>
                  </div>
                  <p
                    className={[
                      "font-semibold text-[13px] leading-tight",
                      isDone ? "text-white" : "text-[#18231f]",
                    ].join(" ")}
                  >
                    {habit.label}
                  </p>
                  <p
                    className={[
                      "text-[10px]",
                      isDone ? "text-[#6db898]" : "text-[#657a71]",
                    ].join(" ")}
                  >
                    {habit.frequency}
                  </p>
                </button>
              );
            })}
          </section>
        ) : (
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6 text-center">
            <p className="font-semibold text-[#18231f] text-sm">
              No habits scheduled today.
            </p>
            <p className="text-[12px] text-[#657a71] mt-1">
              Open Habit Manager to add habits.
            </p>
          </div>
        )}

        {/* ── COACH CARD ─────────────────────────────────── */}
        <article className="bg-white border border-black/[0.06] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-1">
            <p className="text-[11px] text-[#d3a74d] font-bold uppercase tracking-wider">
              Daily Summary
            </p>
            <span className="text-[10px] bg-[#faf5eb] text-[#5d6f65] font-semibold px-2 py-0.5 rounded-full">
              Today at a glance
            </span>
          </div>
          <h2 className="font-black text-[#18231f] text-lg leading-tight">
            {coachHeadline}
          </h2>
          <p className="text-[13px] text-[#5d6f65] mt-2 leading-relaxed">
            {coachNote}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {coachChips.map((chip) => (
              <span
                key={chip}
                className="text-[11px] bg-[#faf5eb] text-[#5d6f65] font-medium px-2.5 py-1 rounded-full border border-black/[0.05]"
              >
                {chip}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {coachSteps.map((step) => (
              <div key={step.title} className="bg-[#faf5eb] rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base" aria-hidden="true">
                    {step.icon}
                  </span>
                  <span className="text-[9px] font-bold text-[#1f5a46] bg-[#1f5a46]/10 px-1.5 py-0.5 rounded-full">
                    {step.status}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#18231f] leading-tight">
                  {step.title}
                </p>
                <p className="text-[10px] text-[#657a71] leading-snug mt-0.5">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </article>

        {/* ── VERSE CARD ─────────────────────────────────── */}
        <article
          className="rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, #0c1c12 0%, #17372c 100%)",
          }}
        >
          <p className="text-[11px] text-[#d3a74d] font-bold uppercase tracking-wider mb-1">
            Verse of the Day
          </p>
          <h2 className="font-bold text-[#6db898] text-base mb-3">
            Quran
          </h2>
          <p
            className="text-[#f0cb6a] text-xl leading-relaxed text-right mb-3"
            dir="rtl"
            lang="ar"
          >
            {verse.arabic}
          </p>
          <p className="text-white/90 text-[13px] leading-relaxed mb-2 font-medium">
            {verse.translation}
          </p>
          <p className="text-[#6db898] text-[12px] leading-relaxed mb-2 italic">
            {verse.reflection}
          </p>
          <p className="text-[#d3a74d]/70 text-[11px] font-semibold">
            {verse.reference}
          </p>
        </article>

        {/* ── QURAN STUDY ────────────────────────────────── */}
        <section
          className={[
            "bg-white border-2 rounded-2xl p-5 transition-colors",
            quranStudyDone ? "border-[#1f5a46]" : "border-black/[0.06]",
          ].join(" ")}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[11px] text-[#657a71] font-bold uppercase tracking-wider">
                Page of the day
              </p>
              <h2 className="font-black text-[#18231f] text-base mt-0.5">
                Quran + tafseer reading
              </h2>
            </div>
            <span className="text-[11px] font-bold text-[#1f5a46] bg-[#1f5a46]/10 px-2.5 py-1 rounded-full shrink-0">
              Page {quranStudy.page}
            </span>
          </div>
          <p className="text-[#5d6f65] font-semibold text-sm mb-2">
            {quranStudy.surah}
          </p>
          <p
            className="text-[#18231f] text-lg leading-relaxed text-right mb-3"
            dir="rtl"
            lang="ar"
          >
            {quranStudy.arabic}
          </p>
          <p className="text-[#5d6f65] text-[13px] leading-relaxed mb-3">
            {quranStudy.translation}
          </p>
          <div className="bg-[#faf5eb] rounded-xl p-3 mb-4">
            <p className="text-[10px] font-bold text-[#657a71] uppercase tracking-wider mb-1">
              Tafseer snapshot
            </p>
            <p className="text-[12px] text-[#5d6f65] leading-relaxed">
              {quranStudy.tafsir}
            </p>
          </div>
          <p className="text-[12px] text-[#657a71] mb-4 leading-relaxed">
            {quranStudy.practice}
          </p>
          <div className="flex gap-2.5">
            <Link
              className="flex-1 text-center text-[13px] font-semibold text-[#1f5a46] border border-[#1f5a46]/30 py-2.5 rounded-xl hover:bg-[#1f5a46]/[0.05] transition-colors"
              to="/quran"
            >
              Open Quran
            </Link>
            <button
              type="button"
              onClick={onToggleQuranStudy}
              className={[
                "flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 active:scale-[0.97]",
                quranStudyDone
                  ? "bg-[#1f5a46] text-[#f0cb6a]"
                  : "bg-[#17372c] text-white hover:bg-[#1f5a46]",
              ].join(" ")}
            >
              {quranStudyDone ? "✓ Reading logged" : "Mark done"}
            </button>
          </div>
        </section>

        {/* ── MISSION BOARD ──────────────────────────────── */}
        <article className="bg-white border border-black/[0.06] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-black text-[#18231f] text-base">
                Today's Focus
              </h2>
              <p className="text-[11px] text-[#657a71] mt-0.5">
                Your top 3 tasks for today.
              </p>
            </div>
            <span
              className={[
                "text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0",
                focusDoneCount === 3
                  ? "bg-[#1f5a46] text-[#f0cb6a]"
                  : "bg-[#faf5eb] text-[#5d6f65]",
              ].join(" ")}
            >
              {focusDoneCount}/3 done
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {focusItems.map((item) => (
              <div
                key={item.id}
                className={[
                  "rounded-xl border p-3.5 transition-colors",
                  item.done
                    ? "bg-[#f0fdf4] border-[#1f5a46]/20"
                    : "bg-[#faf5eb] border-transparent",
                ].join(" ")}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={[
                      "text-[10px] font-bold uppercase tracking-wider",
                      item.done ? "text-[#1f5a46]" : "text-[#657a71]",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleFocusItem(item.id)}
                    className={[
                      "text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95",
                      item.done
                        ? "bg-[#1f5a46] text-white"
                        : "bg-white border border-black/[0.1] text-[#5d6f65] hover:border-[#1f5a46]/40",
                    ].join(" ")}
                  >
                    {item.done ? "✓ Done" : "Mark done"}
                  </button>
                </div>
                <input
                  className={[
                    "w-full bg-transparent text-[13px] outline-none placeholder:text-[#657a71]",
                    item.done
                      ? "text-[#1f5a46] line-through decoration-[#1f5a46]/40"
                      : "text-[#18231f]",
                  ].join(" ")}
                  value={item.text}
                  maxLength={64}
                  onChange={(event) =>
                    onFocusItemTextChange(item.id, event.target.value)
                  }
                  placeholder={item.placeholder}
                />
              </div>
            ))}
          </div>
        </article>

        {/* ── VITALS ─────────────────────────────────────── */}
        <article className="bg-white border border-black/[0.06] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-black text-[#18231f] text-base">Energy &amp; Water</h2>
              <p className="text-[11px] text-[#657a71] mt-0.5">
                How are you feeling? How much water?
              </p>
            </div>
            <span className="text-[11px] font-semibold bg-[#faf5eb] text-[#5d6f65] px-2.5 py-1 rounded-full">
              {energy ? energy.label : "Check in"}
            </span>
          </div>
          <div className="mb-4">
            <p className="text-[10px] font-bold text-[#657a71] uppercase tracking-wider mb-2">
              Energy
            </p>
            <div className="flex flex-col gap-2">
              {energyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onEnergyChange(option.value)}
                  className={[
                    "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-150 active:scale-[0.98]",
                    todayEntry.energy === option.value
                      ? "border-[#1f5a46] bg-[#1f5a46]/[0.06]"
                      : "border-transparent bg-[#faf5eb] hover:border-[#1f5a46]/20",
                  ].join(" ")}
                >
                  <span className="text-xl shrink-0" aria-hidden="true">
                    {option.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={[
                        "text-[13px] font-semibold leading-tight",
                        todayEntry.energy === option.value
                          ? "text-[#1f5a46]"
                          : "text-[#18231f]",
                      ].join(" ")}
                    >
                      {option.label}
                    </p>
                    <p className="text-[11px] text-[#657a71] mt-0.5">
                      {option.cue}
                    </p>
                  </div>
                  {todayEntry.energy === option.value && (
                    <span className="text-[#1f5a46] font-bold shrink-0">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-[#657a71] uppercase tracking-wider">
                Hydration
              </p>
              <span className="text-[11px] font-bold text-[#1f5a46]">
                {waterCups}/{waterGoal} cups
              </span>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {Array.from({ length: waterGoal }, (_, index) => {
                const value = index + 1;
                const isFilled = value <= waterCups;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      onWaterCupsChange(value === waterCups ? value - 1 : value)
                    }
                    aria-label={`Set hydration to ${value} cups`}
                    className={[
                      "flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-90",
                      isFilled
                        ? "bg-[#1f5a46] text-white"
                        : "bg-[#faf5eb] text-[#657a71]",
                    ].join(" ")}
                  >
                    <span aria-hidden="true">{isFilled ? "💧" : "○"}</span>
                    <span>{value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </article>

        {/* ── PRAYER ─────────────────────────────────────── */}
        <article className="bg-white border border-black/[0.06] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-black text-[#18231f] text-base">
                Today's Prayers
              </h2>
              <p className="text-[11px] text-[#657a71] mt-0.5">
                Tap each prayer you completed on time.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={[
                  "text-[11px] font-bold px-2.5 py-1 rounded-full",
                  prayerDoneCount === 5
                    ? "bg-[#1f5a46] text-[#f0cb6a]"
                    : "bg-[#faf5eb] text-[#5d6f65]",
                ].join(" ")}
              >
                {prayerDoneCount}/5
              </span>
              <Link
                className="text-[11px] font-semibold text-[#1f5a46] hover:text-[#17372c] transition-colors"
                to="/prayers"
              >
                History
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {prayers.map((prayer) => (
              <button
                key={prayer.id}
                type="button"
                onClick={() => onTogglePrayer(prayer.id)}
                className={[
                  "flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all duration-200 active:scale-[0.95]",
                  prayer.onTime
                    ? "bg-[#17372c] border-[#17372c]"
                    : "bg-[#faf5eb] border-transparent hover:border-[#1f5a46]/30",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-[12px] font-bold",
                    prayer.onTime ? "text-[#f0cb6a]" : "text-[#18231f]",
                  ].join(" ")}
                >
                  {prayer.label}
                </span>
                <span
                  className={[
                    "text-[9px]",
                    prayer.onTime ? "text-[#6db898]" : "text-[#657a71]",
                  ].join(" ")}
                >
                  {prayer.onTime ? "✓" : prayer.cue}
                </span>
              </button>
            ))}
          </div>
        </article>

        {/* ── DHIKR ──────────────────────────────────────── */}
        <article
          className="rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, #0c1c12 0%, #17372c 100%)",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-black text-white text-base">Dhikr Counter</h2>
              <p className="text-[11px] text-[#6db898] mt-0.5">
                Tap + to count. Goal: {dhikrGoal} remembrances.
              </p>
            </div>
            <span className="font-black text-[#f0cb6a] text-lg leading-none">
              {dhikrCount}
              <span className="text-[#6db898] font-normal text-sm">
                /{dhikrGoal}
              </span>
            </span>
          </div>
          <p
            className="text-[#f0cb6a] text-base text-right mb-3 leading-relaxed"
            dir="rtl"
            lang="ar"
          >
            سُبْحَانَ اللَّهِ • الْحَمْدُ لِلَّهِ • اللَّهُ أَكْبَر
          </p>
          <div className="h-2 bg-white/[0.1] rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${dhikrPercent}%`,
                background: "linear-gradient(90deg,#d3a74d,#f0cb6a)",
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {dhikrQuickSteps.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => onAdjustDhikr(step)}
                className="px-4 py-2.5 rounded-xl font-bold text-[13px] text-[#17372c] bg-[#f0cb6a] hover:bg-[#d3a74d] transition-colors active:scale-95"
              >
                +{step}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onAdjustDhikr(-10)}
              className="px-3 py-2.5 rounded-xl font-semibold text-[13px] text-[#6db898] border border-[#6db898]/30 hover:bg-white/[0.05] transition-colors active:scale-95"
            >
              −10
            </button>
            <button
              type="button"
              onClick={onResetDhikr}
              className="px-3 py-2.5 rounded-xl font-semibold text-[13px] text-[#6db898]/60 border border-white/[0.1] hover:bg-white/[0.05] transition-colors active:scale-95"
            >
              Reset
            </button>
          </div>
        </article>

        {/* ── SLEEP + MOOD ───────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-black text-[#18231f] text-base">
                  Sleep logger
                </h2>
                <p className="text-[11px] text-[#657a71] mt-0.5">
                  Two taps to log.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "text-[11px] font-bold px-2.5 py-1 rounded-full",
                    todayEntry.sleep
                      ? "bg-[#1f5a46] text-[#f0cb6a]"
                      : "bg-[#faf5eb] text-[#657a71]",
                  ].join(" ")}
                >
                  {todayEntry.sleep ? "Logged" : "Pending"}
                </span>
                {todayEntry.sleep ? (
                  <button
                    type="button"
                    onClick={onClearSleep}
                    className="text-[11px] font-semibold text-[#657a71] hover:text-red-400 transition-colors"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>
            <div className="mb-3">
              <p className="text-[10px] font-bold text-[#657a71] uppercase tracking-wider mb-2">
                Bedtime
              </p>
              <div className="flex flex-wrap gap-1.5">
                {bedtimePresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onSleepSelection("bedtime", preset.value)}
                    className={[
                      "px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all active:scale-95",
                      currentBedtime === preset.value
                        ? "bg-[#17372c] text-[#f0cb6a]"
                        : "bg-[#faf5eb] text-[#5d6f65] hover:bg-[#1f5a46]/[0.08]",
                    ].join(" ")}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-[10px] font-bold text-[#657a71] uppercase tracking-wider mb-2">
                Wake time
              </p>
              <div className="flex flex-wrap gap-1.5">
                {wakeTimePresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onSleepSelection("wakeTime", preset.value)}
                    className={[
                      "px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all active:scale-95",
                      currentWakeTime === preset.value
                        ? "bg-[#17372c] text-[#f0cb6a]"
                        : "bg-[#faf5eb] text-[#5d6f65] hover:bg-[#1f5a46]/[0.08]",
                    ].join(" ")}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-[#faf5eb] rounded-xl p-3">
              <p className="text-[10px] font-bold text-[#657a71] uppercase tracking-wider mb-1">
                Tonight's signal
              </p>
              <p className="text-[13px] font-semibold text-[#18231f]">
                {todayEntry.sleep
                  ? `${todayEntry.sleep.hours} hours recovered`
                  : "Select both presets to log sleep."}
              </p>
            </div>
          </section>

          <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-black text-[#18231f] text-base">
                  Mood check
                </h2>
                <p className="text-[11px] text-[#657a71] mt-0.5">
                  One tap keeps the trend honest.
                </p>
              </div>
              <Link
                className="text-[11px] font-semibold text-[#1f5a46] hover:text-[#17372c] transition-colors"
                to="/stats"
              >
                View trend
              </Link>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onMoodChange(option.value)}
                  className={[
                    "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-150 active:scale-[0.98]",
                    todayEntry.mood === option.value
                      ? "border-[#1f5a46] bg-[#1f5a46]/[0.06]"
                      : "border-transparent bg-[#faf5eb] hover:border-[#1f5a46]/20",
                  ].join(" ")}
                >
                  <span className="text-xl shrink-0" aria-hidden="true">
                    {option.emoji}
                  </span>
                  <span
                    className={[
                      "text-[13px] font-semibold flex-1",
                      todayEntry.mood === option.value
                        ? "text-[#1f5a46]"
                        : "text-[#18231f]",
                    ].join(" ")}
                  >
                    {option.label}
                  </span>
                  {todayEntry.mood === option.value && (
                    <span className="text-[#1f5a46] font-bold shrink-0">✓</span>
                  )}
                </button>
              ))}
            </div>
            <div className="bg-[#faf5eb] rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-[#657a71] uppercase tracking-wider mb-1">
                  Current mood
                </p>
                <p className="text-[13px] font-semibold text-[#18231f]">
                  {mood ? `${mood.emoji} ${mood.label}` : "Not checked in yet"}
                </p>
              </div>
              <Link
                className="text-[11px] font-semibold text-[#1f5a46] border border-[#1f5a46]/30 px-2.5 py-1.5 rounded-lg hover:bg-[#1f5a46]/[0.06] transition-colors shrink-0"
                to="/heatmap"
              >
                Weekly
              </Link>
            </div>
          </section>
        </div>

        {/* ── JOURNAL ────────────────────────────────────── */}
        <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-black text-[#18231f] text-base">
                Daily capture
              </h2>
              <p className="text-[11px] text-[#657a71] mt-0.5">
                One win + one dua.
              </p>
            </div>
            <span
              className={[
                "text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0",
                journalReady
                  ? "bg-[#1f5a46] text-[#f0cb6a]"
                  : "bg-[#faf5eb] text-[#657a71]",
              ].join(" ")}
            >
              {journalReady ? "Saved" : "Optional"}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-[#657a71] uppercase tracking-wider">
                One-line win
              </span>
              <textarea
                className="w-full bg-[#faf5eb] rounded-xl p-3.5 text-[13px] text-[#18231f] placeholder:text-[#657a71] outline-none focus:ring-2 focus:ring-[#1f5a46]/25 resize-none leading-relaxed"
                rows={4}
                maxLength={220}
                value={todayEntry.reflection ?? ""}
                onChange={(event) =>
                  onDailyNoteChange("reflection", event.target.value)
                }
                placeholder="What moved forward today?"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-[#657a71] uppercase tracking-wider">
                Dua / support ask
              </span>
              <textarea
                className="w-full bg-[#faf5eb] rounded-xl p-3.5 text-[13px] text-[#18231f] placeholder:text-[#657a71] outline-none focus:ring-2 focus:ring-[#1f5a46]/25 resize-none leading-relaxed"
                rows={4}
                maxLength={220}
                value={todayEntry.dua ?? ""}
                onChange={(event) =>
                  onDailyNoteChange("dua", event.target.value)
                }
                placeholder="What are you asking Allah to open for you right now?"
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}


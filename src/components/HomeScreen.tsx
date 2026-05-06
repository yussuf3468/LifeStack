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

export function HomeScreen({
  greeting,
  longDate,
  quote,
  verse,
  quranStudy,
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
  const mood = moodOptions.find((o) => o.value === todayEntry.mood);
  const focusItems = focusSlots.map((slot) => {
    const item = todayEntry.focusItems?.find((fi) => fi.id === slot.id);
    return { ...slot, text: item?.text ?? "", done: item?.done ?? false };
  });
  const prayers = prayerSlots.map((slot) => {
    const item = todayEntry.prayers?.find((p) => p.id === slot.id);
    return { ...slot, onTime: item?.onTime ?? false };
  });
  const prayerDoneCount = prayers.filter((p) => p.onTime).length;
  const dhikrCount = todayEntry.dhikrCount ?? 0;
  const dhikrPercent = Math.min(
    100,
    Math.round((dhikrCount / dhikrGoal) * 100),
  );
  const waterCups = todayEntry.waterCups ?? 0;
  const journalReady = Boolean(
    todayEntry.reflection?.trim() || todayEntry.dua?.trim(),
  );

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* ── HERO ── */}
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
        <div className="mt-4 flex justify-end">
          <Link
            className="text-[11px] font-semibold text-[#d3a74d] border border-[#d3a74d]/30 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] transition-colors"
            to="/journal"
          >
            History →
          </Link>
        </div>
      </section>

      {/* ── XP STRIP ── */}
      <section
        className="rounded-2xl p-4 border"
        style={{
          background: "rgba(255,253,248,0.08)",
          borderColor: "rgba(255,253,248,0.15)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <p
            className="text-[13px] font-bold"
            style={{ color: "rgba(255,253,248,0.8)" }}
          >
            Level {xp.level} · {xp.percent}%
          </p>
          <div className="flex gap-3 text-center">
            {[
              { v: String(xp.completedCount), l: "Habits" },
              {
                v: todayEntry.sleep ? `${todayEntry.sleep.hours}h` : "—",
                l: "Sleep",
              },
              { v: mood ? mood.emoji : "—", l: "Mood" },
              { v: `${prayerDoneCount}/5`, l: "Prayers" },
            ].map(({ v, l }) => (
              <div key={l}>
                <p
                  className="text-[14px] font-black"
                  style={{ color: "rgba(255,253,248,0.95)" }}
                >
                  {v}
                </p>
                <p
                  className="text-[11px]"
                  style={{ color: "rgba(255,253,248,0.65)" }}
                >
                  {l}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,253,248,0.15)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${xp.percent}%`,
              background: "linear-gradient(90deg,#d3a74d,#f0cb6a)",
            }}
          />
        </div>
      </section>

      {/* ── HABITS ── */}
      <div className="flex items-center justify-between px-1">
        <h2
          className="font-bold text-base tracking-tight"
          style={{ color: "rgba(255,253,248,0.92)" }}
        >
          Today's Habits
        </h2>
        <Link
          className="text-[12px] font-semibold"
          style={{ color: "#6db898" }}
          to="/manager"
        >
          Edit →
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
                className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200 active:scale-[0.96]"
                style={{
                  background: isDone
                    ? "rgba(31,90,70,0.6)"
                    : "rgba(255,253,248,0.08)",
                  border: `2px solid ${isDone ? "#2f8a67" : "rgba(255,253,248,0.16)"}`,
                }}
              >
                <span className="text-xl shrink-0">{habit.icon}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-[13px] leading-tight truncate"
                    style={{
                      color: isDone ? "#f0cb6a" : "rgba(255,253,248,0.88)",
                    }}
                  >
                    {habit.label}
                  </p>
                  <p
                    className="text-[11px] mt-0.5"
                    style={{
                      color: isDone ? "#6db898" : "rgba(255,253,248,0.65)",
                    }}
                  >
                    {isDone ? "✓ Done" : habit.frequency}
                  </p>
                </div>
              </button>
            );
          })}
        </section>
      ) : (
        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: "rgba(255,253,248,0.04)",
            border: "1px solid rgba(255,253,248,0.07)",
          }}
        >
          <p
            className="font-semibold text-sm"
            style={{ color: "rgba(255,253,248,0.7)" }}
          >
            No habits today.
          </p>
          <Link
            to="/manager"
            className="text-[12px] mt-1 block"
            style={{ color: "#6db898" }}
          >
            Add habits →
          </Link>
        </div>
      )}

      {/* ── PRAYERS ── */}
      <section
        className="rounded-2xl p-5 border"
        style={{
          background: "rgba(255,253,248,0.08)",
          borderColor: "rgba(255,253,248,0.15)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2
            className="font-bold text-base"
            style={{ color: "rgba(255,253,248,0.95)" }}
          >
            Prayers
          </h2>
          <div className="flex items-center gap-2">
            <span
              className="text-[13px] font-bold"
              style={{
                color:
                  prayerDoneCount === 5 ? "#f0cb6a" : "rgba(255,253,248,0.75)",
              }}
            >
              {prayerDoneCount}/5
            </span>
            <Link
              className="text-[11px] font-semibold"
              style={{ color: "#6db898" }}
              to="/prayers"
            >
              History →
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {prayers.map((prayer) => (
            <button
              key={prayer.id}
              type="button"
              aria-pressed={prayer.onTime}
              disabled={prayer.onTime}
              onClick={() => onTogglePrayer(prayer.id)}
              className="flex flex-col items-center gap-1 py-3.5 rounded-xl transition-all active:scale-[0.95] disabled:cursor-default disabled:active:scale-100"
              style={{
                background: prayer.onTime
                  ? "rgba(31,90,70,0.65)"
                  : "rgba(255,253,248,0.09)",
                border: `2px solid ${prayer.onTime ? "#2f8a67" : "rgba(255,253,248,0.2)"}`,
                opacity: prayer.onTime ? 1 : 1,
              }}
            >
              <span
                className="text-[13px] font-bold"
                style={{
                  color: prayer.onTime ? "#f0cb6a" : "rgba(255,253,248,0.9)",
                }}
              >
                {prayer.label}
              </span>
              <span
                className="text-[11px]"
                style={{
                  color: prayer.onTime ? "#6db898" : "rgba(255,253,248,0.6)",
                }}
              >
                {prayer.onTime ? "✓" : prayer.cue}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── DHIKR ── */}
      <article
        className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, #0c1c12 0%, #17372c 100%)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-base text-white">Dhikr</h2>
          <span className="font-black text-[#f0cb6a] text-lg leading-none">
            {dhikrCount}
            <span className="text-[#6db898] font-normal text-sm">
              /{dhikrGoal}
            </span>
          </span>
        </div>
        <p
          className="text-[#f0cb6a] text-sm text-right mb-3"
          dir="rtl"
          lang="ar"
        >
          سُبْحَانَ اللَّهِ • الْحَمْدُ لِلَّهِ • اللَّهُ أَكْبَر
        </p>
        <div
          className="h-2 rounded-full overflow-hidden mb-4"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
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
              className="px-4 py-2.5 rounded-xl font-bold text-[13px] text-[#17372c] bg-[#f0cb6a] active:scale-95 transition-colors"
            >
              +{step}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onAdjustDhikr(-10)}
            className="px-3 py-2.5 rounded-xl font-semibold text-[13px] text-[#6db898] border border-[#6db898]/30 active:scale-95"
          >
            −10
          </button>
          <button
            type="button"
            onClick={onResetDhikr}
            className="px-3 py-2.5 rounded-xl font-semibold text-[13px] border border-white/25 active:scale-95"
            style={{ color: "rgba(255,253,248,0.65)" }}
          >
            Reset
          </button>
        </div>
      </article>

      {/* ── TODAY'S FOCUS ── */}
      <section
        className="rounded-2xl p-5 border"
        style={{
          background: "rgba(255,253,248,0.08)",
          borderColor: "rgba(255,253,248,0.15)",
        }}
      >
        <h2
          className="font-bold text-base mb-3"
          style={{ color: "rgba(255,253,248,0.95)" }}
        >
          Today's Focus
          <span
            className="ml-2 text-[12px] font-semibold"
            style={{ color: "rgba(255,253,248,0.65)" }}
          >
            {focusItems.filter((i) => i.done).length}/3 done
          </span>
        </h2>
        <div className="flex flex-col gap-3">
          {focusItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onToggleFocusItem(item.id)}
                className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all active:scale-90"
                style={{
                  background: item.done ? "#2f8a67" : "transparent",
                  borderColor: item.done ? "#2f8a67" : "rgba(255,253,248,0.4)",
                }}
              >
                {item.done && (
                  <span className="text-white text-[11px] font-black">✓</span>
                )}
              </button>
              <input
                className="flex-1 bg-transparent text-[13px] outline-none"
                style={{
                  color: item.done
                    ? "rgba(255,253,248,0.55)"
                    : "rgba(255,253,248,0.92)",
                  textDecoration: item.done ? "line-through" : "none",
                }}
                value={item.text}
                maxLength={64}
                onChange={(e) => onFocusItemTextChange(item.id, e.target.value)}
                placeholder={item.placeholder}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── SLEEP + MOOD ── */}
      <section
        className="rounded-2xl p-5 border"
        style={{
          background: "rgba(255,253,248,0.08)",
          borderColor: "rgba(255,253,248,0.15)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="font-bold text-base"
            style={{ color: "rgba(255,253,248,0.92)" }}
          >
            Sleep &amp; Mood
          </h2>
          {todayEntry.sleep && (
            <button
              type="button"
              onClick={onClearSleep}
              className="text-[12px] font-semibold transition-colors"
              style={{ color: "rgba(255,253,248,0.65)" }}
            >
              Clear sleep
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "rgba(255,253,248,0.7)" }}
            >
              Bedtime
            </p>
            <select
              value={currentBedtime}
              onChange={(e) => onSleepSelection("bedtime", e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-[13px] font-semibold outline-none appearance-none"
              style={{
                background: currentBedtime
                  ? "rgba(31,90,70,0.4)"
                  : "rgba(255,253,248,0.1)",
                color: currentBedtime ? "#f0cb6a" : "rgba(255,253,248,0.8)",
                border: `1px solid ${currentBedtime ? "rgba(47,138,103,0.5)" : "rgba(255,253,248,0.2)"}`,
              }}
            >
              <option value="">— pick —</option>
              {bedtimePresets.map((p) => (
                <option
                  key={p.value}
                  value={p.value}
                  style={{ background: "#163325", color: "#fff" }}
                >
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "rgba(255,253,248,0.7)" }}
            >
              Wake up
            </p>
            <select
              value={currentWakeTime}
              onChange={(e) => onSleepSelection("wakeTime", e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-[13px] font-semibold outline-none appearance-none"
              style={{
                background: currentWakeTime
                  ? "rgba(31,90,70,0.4)"
                  : "rgba(255,253,248,0.1)",
                color: currentWakeTime ? "#f0cb6a" : "rgba(255,253,248,0.8)",
                border: `1px solid ${currentWakeTime ? "rgba(47,138,103,0.5)" : "rgba(255,253,248,0.2)"}`,
              }}
            >
              <option value="">— pick —</option>
              {wakeTimePresets.map((p) => (
                <option
                  key={p.value}
                  value={p.value}
                  style={{ background: "#163325", color: "#fff" }}
                >
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {todayEntry.sleep && (
          <p
            className="text-[12px] font-semibold mb-4"
            style={{ color: "#6db898" }}
          >
            ✓ {todayEntry.sleep.hours}h logged
          </p>
        )}
        <p
          className="text-[11px] font-bold uppercase tracking-wider mb-2"
          style={{ color: "rgba(255,253,248,0.7)" }}
        >
          Mood
        </p>
        <div className="flex gap-2">
          {moodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onMoodChange(option.value)}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all active:scale-95"
              style={{
                background:
                  todayEntry.mood === option.value
                    ? "rgba(31,90,70,0.55)"
                    : "rgba(255,253,248,0.09)",
                border: `2px solid ${todayEntry.mood === option.value ? "#2f8a67" : "rgba(255,253,248,0.18)"}`,
              }}
            >
              <span className="text-xl">{option.emoji}</span>
              <span
                className="text-[11px] font-semibold"
                style={{
                  color:
                    todayEntry.mood === option.value
                      ? "#f0cb6a"
                      : "rgba(255,253,248,0.75)",
                }}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── ENERGY + WATER ── */}
      <section
        className="rounded-2xl p-5 border"
        style={{
          background: "rgba(255,253,248,0.08)",
          borderColor: "rgba(255,253,248,0.15)",
        }}
      >
        <h2
          className="font-bold text-base mb-3"
          style={{ color: "rgba(255,253,248,0.95)" }}
        >
          Energy &amp; Water
        </h2>
        <p
          className="text-[11px] font-bold uppercase tracking-wider mb-2"
          style={{ color: "rgba(255,253,248,0.7)" }}
        >
          Energy level
        </p>
        <div className="flex gap-2 mb-4">
          {energyOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onEnergyChange(option.value)}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all active:scale-95"
              style={{
                background:
                  todayEntry.energy === option.value
                    ? "rgba(31,90,70,0.55)"
                    : "rgba(255,253,248,0.09)",
                border: `2px solid ${todayEntry.energy === option.value ? "#2f8a67" : "rgba(255,253,248,0.18)"}`,
              }}
            >
              <span className="text-xl">{option.emoji}</span>
              <span
                className="text-[11px] font-semibold"
                style={{
                  color:
                    todayEntry.energy === option.value
                      ? "#f0cb6a"
                      : "rgba(255,253,248,0.75)",
                }}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between mb-2">
          <p
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: "rgba(255,253,248,0.7)" }}
          >
            Water
          </p>
          <span className="text-[11px] font-bold" style={{ color: "#6db898" }}>
            {waterCups}/{waterGoal} cups
          </span>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {Array.from({ length: waterGoal }, (_, i) => {
            const v = i + 1;
            const filled = v <= waterCups;
            return (
              <button
                key={v}
                type="button"
                onClick={() => onWaterCupsChange(v === waterCups ? v - 1 : v)}
                className="flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-90"
                style={{
                  background: filled
                    ? "rgba(47,138,103,0.55)"
                    : "rgba(255,253,248,0.1)",
                  color: filled ? "#f0cb6a" : "rgba(255,253,248,0.6)",
                }}
              >
                <span>{filled ? "💧" : "○"}</span>
                <span>{v}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── QURAN + VERSE ── */}
      <section
        className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, #0c1c12 0%, #17372c 100%)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base text-white">Quran</h2>
          <Link
            className="text-[11px] font-semibold"
            style={{ color: "#6db898" }}
            to="/quran"
          >
            Open →
          </Link>
        </div>
        <p
          className="text-[#f0cb6a] text-base leading-relaxed text-right mb-2"
          dir="rtl"
          lang="ar"
        >
          {verse.arabic}
        </p>
        <p className="text-white/80 text-[12px] leading-relaxed mb-1">
          {verse.translation}
        </p>
        <p
          className="text-[12px] font-semibold mb-4"
          style={{ color: "#d3a74d" }}
        >
          {verse.reference}
        </p>
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div>
            <p className="text-[12px] font-semibold text-white/80">
              Page {quranStudy.page} · {quranStudy.surah}
            </p>
            <p className="text-[12px] text-white/65 mt-0.5">
              {quranStudy.practice}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleQuranStudy}
            className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-bold transition-all active:scale-95"
            style={{
              background: todayEntry.quranStudyDone
                ? "#2f8a67"
                : "rgba(255,253,248,0.1)",
              color: todayEntry.quranStudyDone
                ? "#f0cb6a"
                : "rgba(255,253,248,0.7)",
            }}
          >
            {todayEntry.quranStudyDone ? "✓ Done" : "Mark done"}
          </button>
        </div>
      </section>

      {/* ── JOURNAL ── */}
      <section
        className="rounded-2xl p-5 border"
        style={{
          background: "rgba(255,253,248,0.08)",
          borderColor: "rgba(255,253,248,0.15)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2
            className="font-bold text-base"
            style={{ color: "rgba(255,253,248,0.95)" }}
          >
            Daily capture
          </h2>
          {journalReady && (
            <span
              className="text-[11px] font-bold"
              style={{ color: "#6db898" }}
            >
              ✓ Saved
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: "rgba(255,253,248,0.7)" }}
            >
              One win today
            </span>
            <textarea
              className="w-full rounded-xl px-3.5 py-3 text-[13px] outline-none resize-none leading-relaxed"
              style={{
                background: "rgba(255,253,248,0.08)",
                color: "rgba(255,253,248,0.92)",
                border: "1px solid rgba(255,253,248,0.18)",
              }}
              rows={3}
              maxLength={220}
              value={todayEntry.reflection ?? ""}
              onChange={(e) => onDailyNoteChange("reflection", e.target.value)}
              placeholder="What moved forward today?"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: "rgba(255,253,248,0.7)" }}
            >
              Dua
            </span>
            <textarea
              className="w-full rounded-xl px-3.5 py-3 text-[13px] outline-none resize-none leading-relaxed"
              style={{
                background: "rgba(255,253,248,0.08)",
                color: "rgba(255,253,248,0.92)",
                border: "1px solid rgba(255,253,248,0.18)",
              }}
              rows={3}
              maxLength={220}
              value={todayEntry.dua ?? ""}
              onChange={(e) => onDailyNoteChange("dua", e.target.value)}
              placeholder="What are you asking Allah for right now?"
            />
          </label>
        </div>
      </section>
    </div>
  );
}

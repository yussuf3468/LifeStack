import type { CSSProperties } from "react";
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
  profile,
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
      title: "Faith anchor",
      status: faithHabit ? (faithDone ? "Locked" : "Up next") : "Open",
      copy: faithHabit
        ? faithDone
          ? `${faithHabit.label} is already protected today.`
          : `Start with ${faithHabit.label} before the rest of the day pulls you wide.`
        : "No dedicated faith habit is scheduled today. Let the Quran spark set the tone.",
    },
    {
      icon: "💻",
      title: "Build lane",
      status: buildHabit ? (buildDone ? "Logged" : "Ready") : "Flexible",
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
      title: "Recovery lane",
      status: recoveryReady
        ? "Readable"
        : todayEntry.sleep || todayEntry.mood
          ? "Almost"
          : "Missing",
      copy: recoveryReady
        ? `Sleep ${todayEntry.sleep?.hours}h and mood ${mood?.label ?? "logged"} give you a readable baseline.`
        : todayEntry.sleep
          ? "Sleep is logged. Add your mood so the stats tell the truth."
          : "Log sleep and mood so effort does not hide fatigue.",
    },
  ];
  const coachChips = [
    "Phase 2",
    "16 Pro Max tuned",
    remainingActions === 0
      ? "Daily loop closed"
      : `${remainingActions} taps left`,
    backendLabel,
  ];

  return (
    <div className="screen">
      <section className="card hero-panel">
        <div>
          <div className="eyebrow">Soul + Sprint OS</div>
          <h1 className="hero-title">{greeting}</h1>
          <p className="hero-supporting">{longDate}</p>
          <p className="hero-quote">“{quote.text}”</p>
          <p className="hero-quote-author">{quote.author}</p>
        </div>

        <div className="hero-side">
          <section className="card quick-card">
            <div className="stack-head">
              <div>
                <h2 className="stack-title">Daily XP</h2>
                <p className="stack-copy">
                  Fast taps, visible momentum, no friction.
                </p>
              </div>
              <div className="mini-chip">{xp.level}</div>
            </div>

            <div className="xp-row">
              <p className="xp-value">{xp.percent}%</p>
              <p className="xp-caption">
                {xp.current}/{xp.max} XP
              </p>
            </div>

            <div className="xp-track" aria-hidden="true">
              <div className="xp-fill" style={{ width: `${xp.percent}%` }} />
            </div>

            <div className="summary-grid">
              <div className="mini-stat">
                <strong>{xp.completedCount}</strong>
                <span>Habits done</span>
              </div>
              <div className="mini-stat">
                <strong>
                  {todayEntry.sleep ? `${todayEntry.sleep.hours}h` : "--"}
                </strong>
                <span>Sleep logged</span>
              </div>
              <div className="mini-stat">
                <strong>{mood ? mood.emoji : "—"}</strong>
                <span>Mood check</span>
              </div>
            </div>

            <div className="sleep-summary">
              <div>
                <p className="muted">Barakah prompt</p>
                <p className="sleep-result">{focusPrompt}</p>
              </div>
              <div className="tiny-badge">{backendLabel}</div>
            </div>
          </section>
        </div>
      </section>

      <section className="coach-deck">
        <article className="card coach-card">
          <div className="section-row">
            <div>
              <p className="section-subtitle coach-kicker">Life coach mode</p>
              <h2 className="section-title">{coachHeadline}</h2>
            </div>
            <div className="mini-chip coach-mini-chip">Phone-first</div>
          </div>

          <p className="coach-note">{coachNote}</p>

          <div className="coach-chip-row">
            {coachChips.map((chip) => (
              <div key={chip} className="coach-chip">
                {chip}
              </div>
            ))}
          </div>

          <div className="coach-grid">
            {coachSteps.map((step) => (
              <article key={step.title} className="coach-step">
                <div className="coach-step-top">
                  <span className="coach-step-icon" aria-hidden="true">
                    {step.icon}
                  </span>
                  <span className="coach-step-status">{step.status}</span>
                </div>
                <p className="coach-step-title">{step.title}</p>
                <p className="coach-step-copy">{step.copy}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="card verse-card">
          <p className="section-subtitle">Faith anchor for {profile.name}</p>
          <h2 className="section-title">Quran spark</h2>
          <p className="verse-arabic">{verse.arabic}</p>
          <p className="verse-copy">{verse.translation}</p>
          <p className="verse-reflection">{verse.reflection}</p>
          <p className="verse-reference">{verse.reference}</p>
        </article>
      </section>

      <section
        className={`card quran-study-card${quranStudyDone ? " is-done" : ""}`}
      >
        <div className="section-row quran-study-topline">
          <div>
            <p className="section-subtitle">Page of the day</p>
            <h2 className="section-title">Quran + tafseer reading</h2>
          </div>
          <div className="mini-chip">Page {quranStudy.page}</div>
        </div>

        <p className="quran-study-surah">{quranStudy.surah}</p>
        <p className="quran-study-arabic">{quranStudy.arabic}</p>
        <p className="quran-study-copy">{quranStudy.translation}</p>

        <div className="tafsir-panel">
          <p className="muted">Tafseer snapshot</p>
          <p className="quran-study-tafsir">{quranStudy.tafsir}</p>
        </div>

        <div className="quran-study-footer">
          <p className="helper-copy quran-study-practice">
            {quranStudy.practice}
          </p>

          <div className="quran-study-actions">
            <Link className="ghost-link" to="/quran">
              Open Quran page
            </Link>
            <button
              type="button"
              className={`secondary-button quran-study-button${quranStudyDone ? " is-active" : ""}`}
              onClick={onToggleQuranStudy}
            >
              {quranStudyDone ? "Reading logged" : "Mark page + tafseer done"}
            </button>
          </div>
        </div>
      </section>

      <div className="section-row">
        <div>
          <h2 className="section-title">Habit grid</h2>
          <p className="section-subtitle">
            Large taps only. Built for under sixty seconds.
          </p>
        </div>
        <Link className="text-link" to="/manager">
          Tune stack
        </Link>
      </div>

      {activeHabits.length > 0 ? (
        <section className="habit-grid">
          {activeHabits.map((habit) => {
            const isDone = todayEntry.completedHabitIds.includes(habit.id);

            return (
              <button
                key={habit.id}
                type="button"
                className={`habit-button${isDone ? " is-done" : ""}`}
                style={{ "--habit-accent": habit.accent } as CSSProperties}
                onClick={() => onToggleHabit(habit.id)}
              >
                <div className="habit-topline">
                  <span className="habit-icon" aria-hidden="true">
                    {habit.icon}
                  </span>
                  <span className="habit-check">{isDone ? "Done" : "Tap"}</span>
                </div>
                <p className="habit-label">{habit.label}</p>
                <p className="habit-meta">{habit.frequency}</p>
                <p className="habit-caption">One clean action counts.</p>
              </button>
            );
          })}
        </section>
      ) : (
        <section className="empty-state">
          <p className="sleep-result">No habits scheduled today.</p>
          <p className="helper-copy">
            Open Habit Manager and build a lighter stack for the days you
            actually live.
          </p>
        </section>
      )}

      <section className="feature-grid">
        <article className="card focus-card">
          <div className="section-row">
            <div>
              <h2 className="section-title">Mission board</h2>
              <p className="section-subtitle">
                Three things only. Keep the day narrow enough to win.
              </p>
            </div>
            <div className="mini-chip">{focusDoneCount}/3 done</div>
          </div>

          <div className="focus-list">
            {focusItems.map((item) => (
              <article
                key={item.id}
                className={`focus-item${item.done ? " is-done" : ""}`}
              >
                <div className="focus-item-top">
                  <span className="focus-slot-label">{item.label}</span>
                  <button
                    type="button"
                    className={`focus-toggle${item.done ? " is-done" : ""}`}
                    onClick={() => onToggleFocusItem(item.id)}
                  >
                    {item.done ? "Done" : "Open"}
                  </button>
                </div>
                <input
                  className="text-input focus-input"
                  value={item.text}
                  maxLength={64}
                  onChange={(event) =>
                    onFocusItemTextChange(item.id, event.target.value)
                  }
                  placeholder={item.placeholder}
                />
              </article>
            ))}
          </div>
        </article>

        <article className="card vitals-card">
          <div className="section-row">
            <div>
              <h2 className="section-title">Vitals</h2>
              <p className="section-subtitle">
                Energy and hydration so your output has context.
              </p>
            </div>
            <div className="mini-chip">
              {energy ? energy.label : "Check in"}
            </div>
          </div>

          <div className="vitals-stack">
            <div className="field">
              <span className="field-label">Energy check</span>
              <div className="energy-row">
                {energyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`choice-button energy-button${todayEntry.energy === option.value ? " is-active" : ""}`}
                    onClick={() => onEnergyChange(option.value)}
                  >
                    <span className="energy-emoji" aria-hidden="true">
                      {option.emoji}
                    </span>
                    <span>{option.label}</span>
                    <span className="energy-copy">{option.cue}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <div className="section-row water-section-head">
                <span className="field-label">Hydration</span>
                <span className="water-count">
                  {waterCups}/{waterGoal} cups
                </span>
              </div>
              <div className="water-grid">
                {Array.from({ length: waterGoal }, (_, index) => {
                  const value = index + 1;
                  const isFilled = value <= waterCups;

                  return (
                    <button
                      key={value}
                      type="button"
                      className={`water-cup${isFilled ? " is-filled" : ""}`}
                      onClick={() =>
                        onWaterCupsChange(
                          value === waterCups ? value - 1 : value,
                        )
                      }
                      aria-label={`Set hydration to ${value} cups`}
                    >
                      <span className="water-cup-icon" aria-hidden="true">
                        💧
                      </span>
                      <span className="water-cup-label">{value}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="faith-grid">
        <article className="card prayer-card">
          <div className="section-row">
            <div>
              <h2 className="section-title">Prayer on time</h2>
              <p className="section-subtitle">
                Guard the five anchors so the rest of the day stays aligned.
              </p>
            </div>
            <div className="section-actions">
              <div className="mini-chip">{prayerDoneCount}/5 protected</div>
              <Link className="mini-button" to="/prayers">
                History
              </Link>
            </div>
          </div>

          <div className="prayer-grid">
            {prayers.map((prayer) => (
              <button
                key={prayer.id}
                type="button"
                className={`prayer-button${prayer.onTime ? " is-done" : ""}`}
                onClick={() => onTogglePrayer(prayer.id)}
              >
                <span className="prayer-name">{prayer.label}</span>
                <span className="prayer-cue">{prayer.cue}</span>
                <span className="prayer-state">
                  {prayer.onTime ? "On time" : "Track"}
                </span>
              </button>
            ))}
          </div>
        </article>

        <article className="card dhikr-card">
          <div className="section-row">
            <div>
              <h2 className="section-title">Dhikr tracker</h2>
              <p className="section-subtitle">
                Keep remembrance alive between classes, bugs, and errands.
              </p>
            </div>
            <div className="mini-chip">
              {dhikrCount}/{dhikrGoal}
            </div>
          </div>

          <p className="dhikr-arabic">
            سُبْحَانَ اللَّهِ • الْحَمْدُ لِلَّهِ • اللَّهُ أَكْبَر
          </p>

          <div className="dhikr-meter" aria-hidden="true">
            <div
              className="dhikr-meter-fill"
              style={{ width: `${dhikrPercent}%` }}
            />
          </div>

          <p className="helper-copy">
            Use quick adds after salah, walking, or the end of a focus block.
          </p>

          <div className="dhikr-actions">
            {dhikrQuickSteps.map((step) => (
              <button
                key={step}
                type="button"
                className="choice-button dhikr-step"
                onClick={() => onAdjustDhikr(step)}
              >
                +{step}
              </button>
            ))}

            <button
              type="button"
              className="ghost-button"
              onClick={() => onAdjustDhikr(-10)}
            >
              Undo 10
            </button>

            <button
              type="button"
              className="ghost-button"
              onClick={onResetDhikr}
            >
              Reset
            </button>
          </div>
        </article>
      </section>

      <div className="split-grid">
        <section className="card sleep-card">
          <div className="section-row">
            <div>
              <h2 className="section-title">Sleep logger</h2>
              <p className="section-subtitle">
                Two taps: bedtime preset, then wake time preset.
              </p>
            </div>
            {todayEntry.sleep ? (
              <button
                type="button"
                className="ghost-button"
                onClick={onClearSleep}
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="field">
            <span className="field-label">Bedtime</span>
            <div className="preset-row">
              {bedtimePresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={`preset-button${currentBedtime === preset.value ? " is-active" : ""}`}
                  onClick={() => onSleepSelection("bedtime", preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field-label">Wake time</span>
            <div className="preset-row">
              {wakeTimePresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={`preset-button${currentWakeTime === preset.value ? " is-active" : ""}`}
                  onClick={() => onSleepSelection("wakeTime", preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sleep-summary">
            <div>
              <p className="muted">Tonight’s signal</p>
              <p className="sleep-result">
                {todayEntry.sleep
                  ? `${todayEntry.sleep.hours} hours recovered`
                  : "Select both presets to log sleep."}
              </p>
            </div>
            <div className="mini-chip">
              {todayEntry.sleep ? "Logged" : "Pending"}
            </div>
          </div>
        </section>

        <section className="card mood-card">
          <div className="section-row">
            <div>
              <h2 className="section-title">Mood check</h2>
              <p className="section-subtitle">
                One tap keeps your trend honest.
              </p>
            </div>
            <Link className="ghost-link" to="/stats">
              View trend
            </Link>
          </div>

          <div className="emoji-row">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`emoji-button mood-option${todayEntry.mood === option.value ? " is-active" : ""}`}
                onClick={() => onMoodChange(option.value)}
              >
                <span className="mood-emoji" aria-hidden="true">
                  {option.emoji}
                </span>
                <span className="mood-label">{option.label}</span>
              </button>
            ))}
          </div>

          <div className="sleep-summary">
            <div>
              <p className="muted">Current mood</p>
              <p className="sleep-result">
                {mood ? `${mood.emoji} ${mood.label}` : "Not checked in yet"}
              </p>
            </div>
            <Link className="mini-button" to="/heatmap">
              Weekly view
            </Link>
          </div>
        </section>
      </div>

      <section className="card journal-card">
        <div className="section-row">
          <div>
            <h2 className="section-title">Daily capture</h2>
            <p className="section-subtitle">
              Store one win and one dua so your day leaves evidence behind.
            </p>
          </div>
          <div className="mini-chip">{journalReady ? "Saved" : "Optional"}</div>
        </div>

        <div className="journal-grid">
          <label className="field">
            <span className="field-label">One-line win</span>
            <textarea
              className="text-area"
              rows={4}
              maxLength={220}
              value={todayEntry.reflection ?? ""}
              onChange={(event) =>
                onDailyNoteChange("reflection", event.target.value)
              }
              placeholder="What moved forward today?"
            />
          </label>

          <label className="field">
            <span className="field-label">Dua / support ask</span>
            <textarea
              className="text-area"
              rows={4}
              maxLength={220}
              value={todayEntry.dua ?? ""}
              onChange={(event) => onDailyNoteChange("dua", event.target.value)}
              placeholder="What are you asking Allah to open for you right now?"
            />
          </label>
        </div>
      </section>
    </div>
  );
}

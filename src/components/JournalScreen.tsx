import { useState } from "react";
import { MOOD_OPTIONS, PRAYER_SLOTS } from "../data/content";
import { getDateKey, listDates } from "../lib/date";
import type { DailyEntry, Habit } from "../types";

interface JournalScreenProps {
  daily: Record<string, DailyEntry>;
  habits: Habit[];
}

function formatDay(dateKey: string) {
  const d = new Date(dateKey + "T12:00:00");
  return {
    weekday: d.toLocaleDateString("en-GB", { weekday: "long" }),
    short: d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  };
}

function scoreEntry(entry: DailyEntry): number {
  let s = 0;
  if (entry.sleep) s += 1;
  if (entry.mood) s += 1;
  if (entry.energy) s += 1;
  const prayers = entry.prayers?.filter((p) => p.onTime).length ?? 0;
  s += prayers;
  if ((entry.dhikrCount ?? 0) >= 100) s += 1;
  if (entry.quranStudyDone) s += 1;
  if ((entry.completedHabitIds?.length ?? 0) > 0) s += 1;
  if (entry.reflection?.trim()) s += 1;
  if (entry.dua?.trim()) s += 1;
  return s; // 0-11
}

function DayCard({
  dateKey,
  entry,
  habits,
  defaultOpen,
}: {
  dateKey: string;
  entry: DailyEntry;
  habits: Habit[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { weekday, short } = formatDay(dateKey);
  const moodOpt = entry.mood
    ? MOOD_OPTIONS.find((o) => o.value === entry.mood)
    : null;
  const prayers = entry.prayers ?? [];
  const prayerCount = prayers.filter((p) => p.onTime).length;
  const completedHabits = habits.filter((h) =>
    entry.completedHabitIds?.includes(h.id),
  );
  const score = scoreEntry(entry);
  const isToday = dateKey === getDateKey();

  const scoreColor =
    score >= 8 ? "#6db898" : score >= 5 ? "#d3a74d" : "rgba(255,253,248,0.35)";

  return (
    <article
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "rgba(255,253,248,0.04)",
        borderColor: open ? "rgba(255,253,248,0.12)" : "rgba(255,253,248,0.07)",
      }}
    >
      {/* Header row — always visible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <p
              className="text-[13px] font-black"
              style={{ color: "rgba(255,253,248,0.92)" }}
            >
              {weekday}
              {isToday && (
                <span
                  className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(211,167,77,0.2)",
                    color: "#f0cb6a",
                  }}
                >
                  Today
                </span>
              )}
            </p>
          </div>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "rgba(255,253,248,0.4)" }}
          >
            {short}
          </p>
        </div>

        {/* Snapshot pills */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 items-center">
            {moodOpt && (
              <span className="text-base leading-none">{moodOpt.emoji}</span>
            )}
            <span
              className="text-[11px] font-black"
              style={{
                color:
                  prayerCount === 5
                    ? "#6db898"
                    : prayerCount >= 3
                      ? "#d3a74d"
                      : "rgba(255,253,248,0.35)",
              }}
            >
              🕌 {prayerCount}/5
            </span>
            <span
              className="text-[11px] font-black"
              style={{ color: scoreColor }}
            >
              ✦ {score}
            </span>
          </div>
          <span
            className="text-[15px]"
            style={{
              color: "rgba(255,253,248,0.4)",
              transform: open ? "rotate(180deg)" : "none",
              display: "inline-block",
              transition: "transform 0.2s",
            }}
          >
            ▾
          </span>
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div
          className="px-4 pb-4 flex flex-col gap-4"
          style={{ borderTop: "1px solid rgba(255,253,248,0.07)" }}
        >
          {/* Row 1: Sleep + Mood + Energy */}
          <div className="flex gap-3 pt-3">
            <div
              className="flex-1 rounded-xl p-3"
              style={{ background: "rgba(255,253,248,0.05)" }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: "rgba(255,253,248,0.4)" }}
              >
                Sleep
              </p>
              <p
                className="font-black text-lg"
                style={{ color: "rgba(255,253,248,0.9)" }}
              >
                {entry.sleep ? `${entry.sleep.hours}h` : "—"}
              </p>
              {entry.sleep && (
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: "rgba(255,253,248,0.4)" }}
                >
                  {entry.sleep.bedtime} → {entry.sleep.wakeTime}
                </p>
              )}
            </div>
            <div
              className="flex-1 rounded-xl p-3"
              style={{ background: "rgba(255,253,248,0.05)" }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: "rgba(255,253,248,0.4)" }}
              >
                Mood
              </p>
              <p
                className="font-black text-lg"
                style={{ color: "rgba(255,253,248,0.9)" }}
              >
                {moodOpt ? `${moodOpt.emoji} ${moodOpt.label}` : "—"}
              </p>
            </div>
            <div
              className="flex-1 rounded-xl p-3"
              style={{ background: "rgba(255,253,248,0.05)" }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: "rgba(255,253,248,0.4)" }}
              >
                Energy
              </p>
              <p
                className="font-black text-lg"
                style={{ color: "rgba(255,253,248,0.9)" }}
              >
                {entry.energy === "drained"
                  ? "🪫"
                  : entry.energy === "steady"
                    ? "⚖️"
                    : entry.energy === "sharp"
                      ? "🚀"
                      : "—"}{" "}
                <span className="text-[12px] font-semibold capitalize">
                  {entry.energy ?? ""}
                </span>
              </p>
            </div>
          </div>

          {/* Prayers */}
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-wider mb-2"
              style={{ color: "rgba(255,253,248,0.4)" }}
            >
              Prayers
            </p>
            <div className="flex gap-2">
              {PRAYER_SLOTS.map((slot) => {
                const done = prayers.some((p) => p.id === slot.id && p.onTime);
                return (
                  <div
                    key={slot.id}
                    className="flex-1 py-2 rounded-xl text-center text-[11px] font-bold"
                    style={{
                      background: done
                        ? "rgba(47,138,103,0.18)"
                        : "rgba(220,60,60,0.08)",
                      color: done ? "#6db898" : "rgba(255,253,248,0.3)",
                    }}
                  >
                    {slot.label[0]}
                    <span className="block text-[9px] font-normal mt-0.5">
                      {done ? "✓" : "✗"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Water + Dhikr + Quran */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "Water",
                value: entry.waterCups != null ? `${entry.waterCups}/8` : "—",
              },
              {
                label: "Dhikr",
                value:
                  entry.dhikrCount != null ? String(entry.dhikrCount) : "—",
              },
              { label: "Quran", value: entry.quranStudyDone ? "✓ Done" : "—" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl p-3 text-center"
                style={{ background: "rgba(255,253,248,0.05)" }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: "rgba(255,253,248,0.4)" }}
                >
                  {label}
                </p>
                <p
                  className="font-black text-base mt-1"
                  style={{ color: "rgba(255,253,248,0.88)" }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Focus items */}
          {entry.focusItems?.some((f) => f.text.trim()) && (
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-2"
                style={{ color: "rgba(255,253,248,0.4)" }}
              >
                Focus
              </p>
              <div className="flex flex-col gap-1.5">
                {entry
                  .focusItems!.filter((f) => f.text.trim())
                  .map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                      style={{ background: "rgba(255,253,248,0.05)" }}
                    >
                      <span
                        className="text-sm shrink-0"
                        style={{
                          color: f.done ? "#6db898" : "rgba(255,253,248,0.3)",
                        }}
                      >
                        {f.done ? "✓" : "○"}
                      </span>
                      <p
                        className="text-[12px] font-semibold"
                        style={{
                          color: f.done
                            ? "rgba(255,253,248,0.7)"
                            : "rgba(255,253,248,0.88)",
                          textDecoration: f.done ? "line-through" : "none",
                        }}
                      >
                        {f.text}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Habits */}
          {completedHabits.length > 0 && (
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-2"
                style={{ color: "rgba(255,253,248,0.4)" }}
              >
                Habits done ({completedHabits.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {completedHabits.map((h) => (
                  <span
                    key={h.id}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(47,138,103,0.15)",
                      color: "#6db898",
                    }}
                  >
                    {h.icon} {h.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reflection + Dua */}
          {(entry.reflection?.trim() || entry.dua?.trim()) && (
            <div className="flex flex-col gap-3">
              {entry.reflection?.trim() && (
                <div
                  className="rounded-xl p-3"
                  style={{
                    background: "rgba(211,167,77,0.07)",
                    border: "1px solid rgba(211,167,77,0.15)",
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: "#d3a74d" }}
                  >
                    One win
                  </p>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "rgba(255,253,248,0.85)" }}
                  >
                    {entry.reflection}
                  </p>
                </div>
              )}
              {entry.dua?.trim() && (
                <div
                  className="rounded-xl p-3"
                  style={{
                    background: "rgba(109,184,152,0.07)",
                    border: "1px solid rgba(109,184,152,0.15)",
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: "#6db898" }}
                  >
                    Dua
                  </p>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "rgba(255,253,248,0.85)" }}
                  >
                    {entry.dua}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export function JournalScreen({ daily, habits }: JournalScreenProps) {
  const [range, setRange] = useState<30 | 60 | 90>(30);
  const dates = listDates(range).reverse(); // most recent first
  const loggedDates = dates
    .map((d) => getDateKey(d))
    .filter((key) => {
      const e = daily[key];
      if (!e) return false;
      return (
        (e.completedHabitIds?.length ?? 0) > 0 ||
        e.mood ||
        e.sleep ||
        e.energy ||
        e.prayers?.some((p) => p.onTime) ||
        (e.dhikrCount ?? 0) > 0 ||
        e.quranStudyDone ||
        e.reflection?.trim() ||
        e.dua?.trim() ||
        e.focusItems?.some((f) => f.text.trim())
      );
    });

  const totalLogged = loggedDates.length;
  const todayKey = getDateKey();

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Hero */}
      <section
        className="rounded-2xl px-5 pt-5 pb-6"
        style={{
          background: "linear-gradient(145deg, #17372c 0%, #1f5a46 85%)",
        }}
      >
        <p className="text-[11px] text-[#6db898] font-bold uppercase tracking-widest mb-2">
          Daily History
        </p>
        <h1 className="text-[1.65rem] font-black text-white leading-tight tracking-tight">
          Your Journal
        </h1>
        <p className="text-[#6db898] text-sm mt-1">
          {totalLogged} {totalLogged === 1 ? "day" : "days"} logged in the last{" "}
          {range} days.
        </p>

        {/* Range toggle */}
        <div className="mt-4 flex gap-2">
          {([30, 60, 90] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className="px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all"
              style={{
                background:
                  range === r
                    ? "rgba(211,167,77,0.25)"
                    : "rgba(255,253,248,0.07)",
                color: range === r ? "#f0cb6a" : "rgba(255,253,248,0.5)",
                border: `1px solid ${range === r ? "rgba(211,167,77,0.4)" : "rgba(255,253,248,0.1)"}`,
              }}
            >
              {r}d
            </button>
          ))}
        </div>
      </section>

      {/* Day cards */}
      {loggedDates.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: "rgba(255,253,248,0.04)",
            border: "1px solid rgba(255,253,248,0.07)",
          }}
        >
          <p
            className="text-[15px] font-black"
            style={{ color: "rgba(255,253,248,0.7)" }}
          >
            Nothing logged yet.
          </p>
          <p
            className="text-[12px] mt-1.5"
            style={{ color: "rgba(255,253,248,0.4)" }}
          >
            Start filling in the home screen — it will all show up here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {loggedDates.map((key, i) => (
            <DayCard
              key={key}
              dateKey={key}
              entry={daily[key]!}
              habits={habits}
              defaultOpen={i === 0 && key === todayKey}
            />
          ))}
        </div>
      )}
    </div>
  );
}

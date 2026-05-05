import { Link } from "react-router-dom";
import {
  getAverageDhikr,
  getAverageFocusCompletion,
  getAveragePrayerCompletion,
  getAverageWater,
  getHabitCompletionRate,
  getHabitStreak,
  getJournalDays,
  getMoodAverage,
  getMoodTrend,
  getPrayerAveragesByPrayer,
  getPrayerHistory,
  getQuranStudyDays,
  getSleepAverage,
} from "../lib/stats";
import { MOOD_OPTIONS, PRAYER_SLOTS } from "../data/content";
import { getDateKey, listDates } from "../lib/date";
import type { DailyEntry, Habit } from "../types";

interface StatsScreenProps {
  habits: Habit[];
  daily: Record<string, DailyEntry>;
}

const chartWidth = 640;
const chartHeight = 260;
const chartPadding = { top: 18, right: 18, bottom: 34, left: 24 };

function buildChartPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

export function StatsScreen({ habits, daily }: StatsScreenProps) {
  const moodTrend = getMoodTrend(daily);
  const sleepAverage = getSleepAverage(daily);
  const moodAverage = getMoodAverage(daily);
  const prayerAverage = getAveragePrayerCompletion(daily);
  const dhikrAverage = getAverageDhikr(daily);
  const quranStudyDays = getQuranStudyDays(daily);
  const waterAverage = getAverageWater(daily);
  const focusAverage = getAverageFocusCompletion(daily);
  const journalDays = getJournalDays(daily);
  const prayerHistory = getPrayerHistory(daily, 14);
  const prayerAverages = getPrayerAveragesByPrayer(daily, 14);
  const last7 = listDates(7).reverse();
  const streaks = habits
    .map((habit) => ({
      habit,
      completionRate: getHabitCompletionRate(habit, daily),
      ...getHabitStreak(habit, daily),
    }))
    .sort(
      (left, right) =>
        right.current - left.current || right.longest - left.longest,
    );

  const currentStreaks = streaks.filter((streak) => streak.current > 0);
  const longestStreaks = [...streaks].sort(
    (left, right) => right.longest - left.longest,
  );

  const innerWidth = chartWidth - chartPadding.left - chartPadding.right;
  const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const points = moodTrend.map((entry, index) => ({
    x:
      chartPadding.left +
      (moodTrend.length === 1
        ? innerWidth / 2
        : (index / (moodTrend.length - 1)) * innerWidth),
    y: chartPadding.top + ((5 - entry.mood) / 4) * innerHeight,
    label: entry.label,
    date: entry.date,
  }));
  const chartPath = buildChartPath(points);

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
          Your Progress
        </p>
        <h1 className="text-[1.65rem] font-black text-white leading-tight tracking-tight">
          Stats
        </h1>
        <p className="text-[#6db898] text-sm mt-1">
          Sleep, mood, prayers, and habit streaks over the last 14 days.
        </p>
        <div className="mt-4 flex justify-end">
          <Link
            className="text-[11px] font-semibold text-[#6db898] border border-[#6db898]/30 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] transition-colors"
            to="/heatmap"
          >
            Heatmap →
          </Link>
        </div>
      </section>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Average sleep",
            value: sleepAverage ? `${sleepAverage}h` : "--",
            sub: "Across the last 14 days",
          },
          {
            label: "Mood average",
            value: moodAverage ? `${moodAverage}/5` : "--",
            sub: "Recent emotional baseline",
          },
          {
            label: "Prayers on time",
            value: prayerAverage ? `${prayerAverage}/5` : "--",
            sub: "Average protected over 14 days",
          },
          {
            label: "Average dhikr",
            value: dhikrAverage ? `${dhikrAverage}/100` : "--",
            sub: "Average daily remembrance",
          },
          {
            label: "Quran study days",
            value: String(quranStudyDays),
            sub: "Days with page + tafseer done",
          },
          {
            label: "Best live streak",
            value: String(currentStreaks[0]?.current ?? 0),
            sub: "Strongest active habit",
          },
          {
            label: "Average water",
            value: waterAverage ? `${waterAverage}/8` : "--",
            sub: "Daily hydration over 14 days",
          },
          {
            label: "Focus follow-through",
            value: focusAverage ? `${focusAverage}%` : "--",
            sub: "Completion of top 3 priorities",
          },
          {
            label: "Reflection days",
            value: String(journalDays),
            sub: "Days with win or dua captured",
          },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="bg-white border border-black/[0.06] rounded-2xl p-4"
          >
            <p className="text-[10px] font-bold text-[#657a71] uppercase tracking-wider">
              {label}
            </p>
            <p className="font-black text-[#18231f] text-2xl mt-1 leading-none">
              {value}
            </p>
            <p className="text-[11px] text-[#657a71] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── PRAYER CALENDAR ── */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
        <h2 className="font-black text-[#18231f] text-base mb-1">
          Prayer calendar
        </h2>
        <p className="text-[11px] text-[#657a71] mb-4">
          Last 14 days — which prayers were protected each day.
        </p>
        <div className="flex flex-col">
          {prayerHistory.map((row) => (
            <div
              key={row.dateKey}
              className="flex items-center gap-2 py-2.5 border-b border-black/[0.04] last:border-0"
            >
              <p
                className="text-[11px] font-semibold shrink-0 w-16"
                style={{ color: "#657a71" }}
              >
                {row.label.split(",")[0]}
                <span className="font-normal block text-[10px]">
                  {row.label.split(",")[1]?.trim()}
                </span>
              </p>
              {row.logged ? (
                <div className="flex gap-1 flex-1">
                  {PRAYER_SLOTS.map((slot) => {
                    const missed = row.missed.includes(slot.id);
                    return (
                      <span
                        key={slot.id}
                        className="flex-1 py-1 rounded-lg text-center text-[10px] font-bold"
                        style={{
                          background: missed
                            ? "rgba(220,60,60,0.12)"
                            : "rgba(47,138,103,0.15)",
                          color: missed ? "#dc3c3c" : "#2f8a67",
                        }}
                      >
                        {slot.label[0]}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p
                  className="text-[11px] italic flex-1"
                  style={{ color: "rgba(0,0,0,0.25)" }}
                >
                  Not logged
                </p>
              )}
              {row.logged && (
                <span
                  className="text-[11px] font-black w-8 text-right shrink-0"
                  style={{
                    color:
                      row.protectedCount === 5
                        ? "#1f5a46"
                        : row.protectedCount >= 3
                          ? "#d3a74d"
                          : "#dc3c3c",
                  }}
                >
                  {row.protectedCount}/5
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── PER-PRAYER STATS ── */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
        <h2 className="font-black text-[#18231f] text-base mb-1">
          Prayer hit rate
        </h2>
        <p className="text-[11px] text-[#657a71] mb-4">
          Completion for each prayer over the last 14 days.
        </p>
        <div className="flex flex-col gap-4">
          {prayerAverages.map((row) => (
            <div key={row.id}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[13px] font-semibold text-[#18231f]">
                  {row.label}
                </p>
                <div className="flex items-center gap-2.5">
                  {row.missedDays > 0 && (
                    <span className="text-[11px]" style={{ color: "#dc3c3c" }}>
                      {row.missedDays} missed
                    </span>
                  )}
                  <span
                    className="text-[13px] font-black"
                    style={{
                      color:
                        row.loggedDays === 0
                          ? "#657a71"
                          : row.percent >= 80
                            ? "#1f5a46"
                            : row.percent >= 50
                              ? "#d3a74d"
                              : "#dc3c3c",
                    }}
                  >
                    {row.loggedDays === 0 ? "–" : `${row.percent}%`}
                  </span>
                </div>
              </div>
              {row.loggedDays > 0 && (
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "rgba(0,0,0,0.06)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${row.percent}%`,
                      background:
                        row.percent >= 80
                          ? "#2f8a67"
                          : row.percent >= 50
                            ? "#d3a74d"
                            : "#dc3c3c",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── MOOD CHART ── */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-black text-[#18231f] text-base">Mood trend</h2>
            <p className="text-[11px] text-[#657a71] mt-0.5">
              Lightweight line chart over the last two weeks.
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#faf5eb] text-[#5d6f65] shrink-0">
            {moodTrend.length} logged
          </span>
        </div>

        {moodTrend.length > 0 ? (
          <div className="w-full overflow-x-auto rounded-xl">
            <svg
              className="w-full h-auto"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-label="Mood trend chart"
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const y = chartPadding.top + ((5 - value) / 4) * innerHeight;
                return (
                  <g key={value}>
                    <line
                      stroke="rgba(255,253,248,0.08)"
                      strokeWidth="1"
                      x1={chartPadding.left}
                      x2={chartWidth - chartPadding.right}
                      y1={y}
                      y2={y}
                    />
                    <text
                      fill="rgba(255,253,248,0.4)"
                      fontSize="16"
                      x={6}
                      y={y + 4}
                    >
                      {value}
                    </text>
                  </g>
                );
              })}
              {chartPath ? (
                <path
                  d={chartPath}
                  fill="none"
                  stroke="#2f8a67"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
              {points.map((point) => (
                <g key={`${point.date}-${point.x}`}>
                  <circle cx={point.x} cy={point.y} r={6} fill="#1f5a46" />
                  <circle cx={point.x} cy={point.y} r={3} fill="#f0cb6a" />
                  <text
                    fill="rgba(255,253,248,0.4)"
                    fontSize="13"
                    x={point.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                  >
                    {point.date}
                  </text>
                  <title>{`${point.date}: ${point.label}`}</title>
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <p className="font-black text-[#18231f] text-base">
              No mood trend yet.
            </p>
            <p className="text-[12px] text-[#657a71] mt-1">
              Start logging mood on the home screen and the chart will wake up.
            </p>
          </div>
        )}
      </section>

      {/* ── 7-DAY LOG ── */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
        <h2 className="font-black text-[#18231f] text-base mb-1">Daily log</h2>
        <p className="text-[11px] text-[#657a71] mb-4">
          Last 7 days at a glance.
        </p>
        <div className="flex flex-col">
          {last7.map((date) => {
            const key = getDateKey(date);
            const entry = daily[key];
            const moodOpt = entry?.mood
              ? MOOD_OPTIONS.find((o) => o.value === entry.mood)
              : null;
            const prayerCount =
              entry?.prayers?.filter((p) => p.onTime).length ?? null;
            const habitsCount = entry?.completedHabitIds?.length ?? null;
            return (
              <div
                key={key}
                className="py-3 border-b border-black/[0.04] last:border-0"
              >
                <p className="text-[12px] font-bold text-[#18231f] mb-2">
                  {date.toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                {entry != null ? (
                  <div className="grid grid-cols-3 gap-y-1.5 gap-x-3">
                    <span className="text-[11px] text-[#657a71]">
                      😴{" "}
                      <span className="font-semibold text-[#18231f]">
                        {entry.sleep ? `${entry.sleep.hours}h` : "—"}
                      </span>
                    </span>
                    <span className="text-[11px] text-[#657a71]">
                      {moodOpt?.emoji ?? "——"}{" "}
                      <span className="font-semibold text-[#18231f]">
                        {moodOpt?.label ?? "—"}
                      </span>
                    </span>
                    <span className="text-[11px] text-[#657a71]">
                      🕌{" "}
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            prayerCount === 5
                              ? "#1f5a46"
                              : (prayerCount ?? 0) >= 3
                                ? "#d3a74d"
                                : "#dc3c3c",
                        }}
                      >
                        {prayerCount !== null ? `${prayerCount}/5` : "—"}
                      </span>
                    </span>
                    <span className="text-[11px] text-[#657a71]">
                      ✅{" "}
                      <span className="font-semibold text-[#18231f]">
                        {habitsCount !== null ? `${habitsCount} habits` : "—"}
                      </span>
                    </span>
                    <span className="text-[11px] text-[#657a71]">
                      💧{" "}
                      <span className="font-semibold text-[#18231f]">
                        {entry.waterCups != null ? `${entry.waterCups}/8` : "—"}
                      </span>
                    </span>
                    <span className="text-[11px] text-[#657a71]">
                      📿{" "}
                      <span className="font-semibold text-[#18231f]">
                        {entry.dhikrCount != null ? entry.dhikrCount : "—"}
                      </span>
                    </span>
                  </div>
                ) : (
                  <p
                    className="text-[11px] italic"
                    style={{ color: "rgba(0,0,0,0.3)" }}
                  >
                    Nothing logged
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── STREAKS ── */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
        <h2 className="font-black text-[#18231f] text-base mb-1">
          Current streaks
        </h2>
        <p className="text-[11px] text-[#657a71] mb-4">
          What is alive right now.
        </p>
        <div className="flex flex-col">
          {(currentStreaks.length > 0 ? currentStreaks : streaks)
            .slice(0, 6)
            .map((item) => (
              <div
                key={item.habit.id}
                className="flex items-center justify-between py-2.5 border-b border-black/[0.05] last:border-0"
              >
                <div>
                  <p className="text-[13px] font-semibold text-[#18231f]">
                    {item.habit.icon} {item.habit.label}
                  </p>
                  <p className="text-[11px] text-[#657a71] mt-0.5">
                    {item.completionRate}% completion rate
                  </p>
                </div>
                <span className="font-black text-[#1f5a46] text-[13px] ml-3 shrink-0">
                  {item.current} days
                </span>
              </div>
            ))}
        </div>
      </section>

      <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
        <h2 className="font-black text-[#18231f] text-base mb-1">
          Longest streaks
        </h2>
        <p className="text-[11px] text-[#657a71] mb-4">
          Your strongest proof of consistency.
        </p>
        <div className="flex flex-col">
          {longestStreaks.slice(0, 6).map((item) => (
            <div
              key={`${item.habit.id}-longest`}
              className="flex items-center justify-between py-2.5 border-b border-black/[0.05] last:border-0"
            >
              <div>
                <p className="text-[13px] font-semibold text-[#18231f]">
                  {item.habit.icon} {item.habit.label}
                </p>
                <p className="text-[11px] text-[#657a71] mt-0.5">
                  Current: {item.current} days
                </p>
              </div>
              <span className="font-black text-[#1f5a46] text-[13px] ml-3 shrink-0">
                {item.longest} days
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

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
  getQuranStudyDays,
  getSleepAverage,
} from "../lib/stats";
import type { DailyEntry, Habit } from "../types";

interface StatsScreenProps {
  habits: Habit[];
  daily: Record<string, DailyEntry>;
}

const chartWidth = 640;
const chartHeight = 260;
const chartPadding = { top: 18, right: 18, bottom: 34, left: 24 };

function buildChartPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return "";
  }

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
    <div className="screen">
      <header className="screen-header">
        <div className="screen-topline">
          <div>
            <p className="muted">Signal board</p>
            <h1 className="screen-title">Stats</h1>
            <p className="screen-copy">
              Sleep, mood, Quran, and faith signals without dashboard bloat.
            </p>
          </div>
          <Link className="text-link" to="/heatmap">
            Open heatmap
          </Link>
        </div>
      </header>

      <section className="stats-grid">
        <article className="card stats-card">
          <p className="muted">Average sleep</p>
          <strong className="stats-number">
            {sleepAverage ? `${sleepAverage}h` : "--"}
          </strong>
          <p className="stats-label">Across the last 14 days</p>
        </article>

        <article className="card stats-card">
          <p className="muted">Mood average</p>
          <strong className="stats-number">
            {moodAverage ? `${moodAverage}/5` : "--"}
          </strong>
          <p className="stats-label">Recent emotional baseline</p>
        </article>

        <article className="card stats-card">
          <p className="muted">Prayers on time</p>
          <strong className="stats-number">
            {prayerAverage ? `${prayerAverage}/5` : "--"}
          </strong>
          <p className="stats-label">Average protected prayers over 14 days</p>
        </article>

        <article className="card stats-card">
          <p className="muted">Average dhikr</p>
          <strong className="stats-number">
            {dhikrAverage ? `${dhikrAverage}/100` : "--"}
          </strong>
          <p className="stats-label">Average daily remembrance count</p>
        </article>

        <article className="card stats-card">
          <p className="muted">Quran study days</p>
          <strong className="stats-number">{quranStudyDays}</strong>
          <p className="stats-label">Days with page + tafseer completed</p>
        </article>

        <article className="card stats-card">
          <p className="muted">Best live streak</p>
          <strong className="stats-number">
            {currentStreaks[0]?.current ?? 0}
          </strong>
          <p className="stats-label">Days on your strongest active habit</p>
        </article>

        <article className="card stats-card">
          <p className="muted">Average water</p>
          <strong className="stats-number">
            {waterAverage ? `${waterAverage}/8` : "--"}
          </strong>
          <p className="stats-label">Daily hydration over 14 days</p>
        </article>

        <article className="card stats-card">
          <p className="muted">Focus follow-through</p>
          <strong className="stats-number">
            {focusAverage ? `${focusAverage}%` : "--"}
          </strong>
          <p className="stats-label">Completion of your top three priorities</p>
        </article>

        <article className="card stats-card">
          <p className="muted">Reflection days</p>
          <strong className="stats-number">{journalDays}</strong>
          <p className="stats-label">Days with a win or dua captured</p>
        </article>
      </section>

      <section className="card chart-card">
        <div className="chart-meta">
          <div>
            <h2 className="chart-title">Mood trend</h2>
            <p className="chart-copy">
              A lightweight line chart over the last two weeks.
            </p>
          </div>
          <div className="mini-chip">{moodTrend.length} logged days</div>
        </div>

        {moodTrend.length > 0 ? (
          <div className="chart-shell">
            <svg
              className="chart-svg"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-label="Mood trend chart"
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const y = chartPadding.top + ((5 - value) / 4) * innerHeight;

                return (
                  <g key={value}>
                    <line
                      className="chart-grid-line"
                      x1={chartPadding.left}
                      x2={chartWidth - chartPadding.right}
                      y1={y}
                      y2={y}
                    />
                    <text className="chart-axis-label" x={6} y={y + 4}>
                      {value}
                    </text>
                  </g>
                );
              })}

              {chartPath ? <path className="chart-path" d={chartPath} /> : null}

              {points.map((point) => (
                <g key={`${point.date}-${point.x}`}>
                  <circle
                    className="chart-point"
                    cx={point.x}
                    cy={point.y}
                    r={6}
                  />
                  <text
                    className="chart-point-label"
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
          <div className="empty-state">
            <p className="sleep-result">No mood trend yet.</p>
            <p className="helper-copy">
              Start logging mood on the home screen and the chart will wake up.
            </p>
          </div>
        )}
      </section>

      <div className="streak-grid">
        <section className="card list-card stats-card">
          <div>
            <h2 className="chart-title">Current streaks</h2>
            <p className="chart-copy">What is alive right now.</p>
          </div>

          <div className="streak-list">
            {(currentStreaks.length > 0 ? currentStreaks : streaks)
              .slice(0, 6)
              .map((item) => (
                <article key={item.habit.id} className="streak-item">
                  <div>
                    <p className="stats-copy">
                      {item.habit.icon} {item.habit.label}
                    </p>
                    <p className="helper-copy">
                      {item.completionRate}% completion rate
                    </p>
                  </div>
                  <strong>{item.current} days</strong>
                </article>
              ))}
          </div>
        </section>

        <section className="card list-card stats-card">
          <div>
            <h2 className="chart-title">Longest streaks</h2>
            <p className="chart-copy">Your strongest proof of consistency.</p>
          </div>

          <div className="streak-list">
            {longestStreaks.slice(0, 6).map((item) => (
              <article key={`${item.habit.id}-longest`} className="streak-item">
                <div>
                  <p className="stats-copy">
                    {item.habit.icon} {item.habit.label}
                  </p>
                  <p className="helper-copy">Current: {item.current} days</p>
                </div>
                <strong>{item.longest} days</strong>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

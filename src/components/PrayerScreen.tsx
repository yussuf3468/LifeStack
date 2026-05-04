import { Link } from "react-router-dom";
import { getPrayerAveragesByPrayer, getPrayerHistory } from "../lib/stats";
import type { DailyEntry, PrayerSlot } from "../types";

interface PrayerScreenProps {
  daily: Record<string, DailyEntry>;
  todayEntry: DailyEntry;
  prayerSlots: PrayerSlot[];
  onTogglePrayer: (prayerId: PrayerSlot["id"]) => void;
}

export function PrayerScreen({
  daily,
  todayEntry,
  prayerSlots,
  onTogglePrayer,
}: PrayerScreenProps) {
  const todayPrayers = prayerSlots.map((slot) => {
    const item = todayEntry.prayers?.find((prayer) => prayer.id === slot.id);

    return {
      ...slot,
      onTime: item?.onTime ?? false,
    };
  });
  const history = getPrayerHistory(daily, 30);
  const prayerAverages = getPrayerAveragesByPrayer(daily, 30);
  const loggedDays = history.filter((row) => row.logged).length;
  const protectedAverage =
    loggedDays === 0
      ? 0
      : Math.round(
          (history.reduce((sum, row) => sum + row.protectedCount, 0) /
            loggedDays) *
            10,
        ) / 10;
  const missedTotal = history.reduce((sum, row) => sum + row.missed.length, 0);
  const perfectDays = history.filter(
    (row) => row.logged && row.missed.length === 0,
  ).length;
  const prayerLabels = Object.fromEntries(
    prayerSlots.map((slot) => [slot.id, slot.label] as const),
  );

  return (
    <div className="screen">
      <header className="screen-header">
        <div className="screen-topline">
          <div>
            <p className="muted">Prayer history</p>
            <h1 className="screen-title">Prayers</h1>
            <p className="screen-copy">
              Track today, review missed prayers, and see your averages over the
              last month.
            </p>
          </div>
          <Link className="text-link" to="/heatmap">
            Open heatmap
          </Link>
        </div>
      </header>

      <section className="card prayer-screen-card">
        <div className="section-row">
          <div>
            <h2 className="section-title">Today&apos;s prayer board</h2>
            <p className="section-subtitle">
              Mark each prayer on time so the history stays honest.
            </p>
          </div>
          <div className="mini-chip">
            {todayPrayers.filter((prayer) => prayer.onTime).length}/5 protected
          </div>
        </div>

        <div className="prayer-grid">
          {todayPrayers.map((prayer) => (
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
      </section>

      <section className="stats-grid prayer-summary-grid">
        <article className="card stats-card">
          <p className="muted">Protected average</p>
          <strong className="stats-number">
            {loggedDays ? `${protectedAverage}/5` : "--"}
          </strong>
          <p className="stats-label">
            Average prayers on time across logged days
          </p>
        </article>

        <article className="card stats-card">
          <p className="muted">Logged days</p>
          <strong className="stats-number">{loggedDays}</strong>
          <p className="stats-label">
            Days with prayer tracking in the last 30 days
          </p>
        </article>

        <article className="card stats-card">
          <p className="muted">Missed prayers</p>
          <strong className="stats-number">{missedTotal}</strong>
          <p className="stats-label">
            Total missed across the tracked 30-day window
          </p>
        </article>

        <article className="card stats-card">
          <p className="muted">Perfect days</p>
          <strong className="stats-number">{perfectDays}</strong>
          <p className="stats-label">
            Days where all five prayers were protected
          </p>
        </article>
      </section>

      <section className="card list-card prayer-average-card">
        <div>
          <h2 className="chart-title">Average by prayer</h2>
          <p className="chart-copy">
            See which salah is most exposed so your improvement has a target.
          </p>
        </div>

        <div className="prayer-average-grid">
          {prayerAverages.map((row) => (
            <article key={row.id} className="prayer-average-item">
              <div>
                <p className="stats-copy">{row.label}</p>
                <p className="helper-copy">
                  {row.protectedDays}/{row.loggedDays || 0} logged days on time
                </p>
              </div>
              <strong>{row.loggedDays ? `${row.percent}%` : "--"}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="card list-card prayer-history-card">
        <div>
          <h2 className="chart-title">Missed prayer history</h2>
          <p className="chart-copy">
            Review each day and the specific prayers that were missed or left
            untracked.
          </p>
        </div>

        <div className="prayer-history-list">
          {history.map((row) => (
            <article
              key={row.dateKey}
              className="history-row prayer-history-row"
            >
              <div>
                <p className="stats-copy">{row.label}</p>
                <p className="helper-copy">
                  {row.logged
                    ? row.missed.length === 0
                      ? "All five prayers protected"
                      : `Missed: ${row.missed.map((id) => prayerLabels[id]).join(", ")}`
                    : "No prayer log saved"}
                </p>
              </div>
              <span
                className={`history-pill${
                  row.logged && row.missed.length === 0 ? " is-done" : ""
                }`}
              >
                {row.logged ? `${row.protectedCount}/5` : "No log"}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

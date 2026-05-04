import { format, subDays } from "date-fns";
import { Link } from "react-router-dom";
import { QURAN_STUDY_PAGES } from "../data/content";
import { getDateKey, listDates, pickDailyItem } from "../lib/date";
import type { DailyEntry, QuranStudyPage } from "../types";

interface QuranScreenProps {
  daily: Record<string, DailyEntry>;
  todayEntry: DailyEntry;
  studyPage: QuranStudyPage;
  onToggleStudy: () => void;
}

function getQuranStudyStreak(
  daily: Record<string, DailyEntry>,
  today = new Date(),
) {
  let streak = 0;
  let cursor = today;

  while (daily[getDateKey(cursor)]?.quranStudyDone) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }

  return streak;
}

export function QuranScreen({
  daily,
  todayEntry,
  studyPage,
  onToggleStudy,
}: QuranScreenProps) {
  const quranStudyDone = Boolean(todayEntry.quranStudyDone);
  const recentStudy = listDates(21)
    .map((date) => {
      const page = pickDailyItem(QURAN_STUDY_PAGES, 11, date);
      const dateKey = getDateKey(date);

      return {
        dateKey,
        label: format(date, "EEE, d MMM"),
        page,
        done: Boolean(daily[dateKey]?.quranStudyDone),
      };
    })
    .reverse();
  const completedCount = recentStudy.filter((item) => item.done).length;
  const quranStreak = getQuranStudyStreak(daily);

  return (
    <div className="screen">
      <header className="screen-header">
        <div className="screen-topline">
          <div>
            <p className="muted">Daily study</p>
            <h1 className="screen-title">Quran</h1>
            <p className="screen-copy">
              One page, short tafseer, and a practical takeaway you can keep for
              years.
            </p>
          </div>
          <Link className="text-link" to="/stats">
            Open stats
          </Link>
        </div>
      </header>

      <section
        className={`card quran-study-card quran-screen-card${quranStudyDone ? " is-done" : ""}`}
      >
        <div className="section-row quran-study-topline">
          <div>
            <p className="section-subtitle">Today&apos;s reading</p>
            <h2 className="section-title">Page {studyPage.page}</h2>
          </div>
          <div className="mini-chip">
            {quranStudyDone ? "Logged" : "Pending"}
          </div>
        </div>

        <p className="quran-study-surah">{studyPage.surah}</p>
        <p className="quran-study-arabic">{studyPage.arabic}</p>
        <p className="quran-study-copy">{studyPage.translation}</p>

        <div className="tafsir-panel">
          <p className="muted">Tafseer snapshot</p>
          <p className="quran-study-tafsir">{studyPage.tafsir}</p>
        </div>

        <div className="quran-study-footer">
          <p className="helper-copy quran-study-practice">
            {studyPage.practice}
          </p>
          <button
            type="button"
            className={`secondary-button quran-study-button${quranStudyDone ? " is-active" : ""}`}
            onClick={onToggleStudy}
          >
            {quranStudyDone ? "Reading logged" : "Mark page + tafseer done"}
          </button>
        </div>
      </section>

      <section className="stats-grid quran-stats-grid">
        <article className="card stats-card">
          <p className="muted">Current streak</p>
          <strong className="stats-number">{quranStreak}</strong>
          <p className="stats-label">
            Consecutive days with Quran study logged
          </p>
        </article>

        <article className="card stats-card">
          <p className="muted">21-day completions</p>
          <strong className="stats-number">{completedCount}</strong>
          <p className="stats-label">Recent page + tafseer check-ins</p>
        </article>

        <article className="card stats-card">
          <p className="muted">Today&apos;s page</p>
          <strong className="stats-number">{studyPage.page}</strong>
          <p className="stats-label">
            Rotates by date so the reading keeps moving
          </p>
        </article>
      </section>

      <section className="card list-card quran-history-card">
        <div className="section-row">
          <div>
            <h2 className="chart-title">Recent reading log</h2>
            <p className="chart-copy">
              Keep a visible trail of days you read the page and its tafseer.
            </p>
          </div>
        </div>

        <div className="quran-history-list">
          {recentStudy.map((item) => (
            <article key={item.dateKey} className="history-row">
              <div>
                <p className="stats-copy">{item.label}</p>
                <p className="helper-copy">
                  Page {item.page.page} • {item.page.surah}
                </p>
              </div>
              <span className={`history-pill${item.done ? " is-done" : ""}`}>
                {item.done ? "Done" : "Pending"}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

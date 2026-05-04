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
    <div className="flex flex-col gap-4 pb-4">

      {/* ── HERO ── */}
      <section
        className="rounded-2xl px-5 pt-5 pb-6"
        style={{ background: "linear-gradient(145deg, #0c1c12 0%, #17372c 85%)" }}
      >
        <p className="text-[11px] text-[#6db898] font-bold uppercase tracking-widest mb-2">Daily study</p>
        <h1 className="text-[1.65rem] font-black text-white leading-tight tracking-tight">Quran</h1>
        <p className="text-[#6db898] text-sm mt-1">One page, short tafseer, a practical takeaway.</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="font-black text-[#f0cb6a] text-lg leading-none">{quranStreak}</p>
              <p className="text-[10px] text-[#6db898] mt-0.5">Day streak</p>
            </div>
            <div className="text-center">
              <p className="font-black text-[#f0cb6a] text-lg leading-none">{completedCount}</p>
              <p className="text-[10px] text-[#6db898] mt-0.5">Last 21 days</p>
            </div>
            <div className="text-center">
              <p className="font-black text-[#f0cb6a] text-lg leading-none">{studyPage.page}</p>
              <p className="text-[10px] text-[#6db898] mt-0.5">Today's page</p>
            </div>
          </div>
          <Link className="text-[11px] font-semibold text-[#6db898] border border-[#6db898]/30 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] transition-colors" to="/stats">
            Stats →
          </Link>
        </div>
      </section>

      {/* ── TODAY'S READING ── */}
      <section className={["bg-white border-2 rounded-2xl p-5 transition-colors", quranStudyDone ? "border-[#1f5a46]" : "border-black/[0.06]"].join(" ")}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[11px] text-[#8a9e95] font-bold uppercase tracking-wider">Today's reading</p>
            <h2 className="font-black text-[#18231f] text-base mt-0.5">Page {studyPage.page}</h2>
          </div>
          <span className={["text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0", quranStudyDone ? "bg-[#1f5a46] text-[#f0cb6a]" : "bg-[#faf5eb] text-[#8a9e95]"].join(" ")}>
            {quranStudyDone ? "✓ Logged" : "Pending"}
          </span>
        </div>
        <p className="text-[#5d6f65] font-semibold text-sm mb-2">{studyPage.surah}</p>
        <p className="text-[#18231f] text-xl leading-relaxed text-right mb-4" dir="rtl" lang="ar">{studyPage.arabic}</p>
        <p className="text-[#5d6f65] text-[13px] leading-relaxed mb-3">{studyPage.translation}</p>
        <div className="bg-[#faf5eb] rounded-xl p-3 mb-4">
          <p className="text-[10px] font-bold text-[#8a9e95] uppercase tracking-wider mb-1">Tafseer snapshot</p>
          <p className="text-[12px] text-[#5d6f65] leading-relaxed">{studyPage.tafsir}</p>
        </div>
        <p className="text-[12px] text-[#8a9e95] mb-4 leading-relaxed">{studyPage.practice}</p>
        <button
          type="button"
          onClick={onToggleStudy}
          className={["w-full py-3 rounded-xl text-[13px] font-bold transition-all duration-200 active:scale-[0.98]", quranStudyDone ? "bg-[#1f5a46] text-[#f0cb6a]" : "bg-[#17372c] text-white hover:bg-[#1f5a46]"].join(" ")}
        >
          {quranStudyDone ? "✓ Reading logged" : "Mark page + tafseer done"}
        </button>
      </section>

      {/* ── RECENT LOG ── */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
        <h2 className="font-black text-[#18231f] text-base mb-1">Recent reading log</h2>
        <p className="text-[11px] text-[#8a9e95] mb-4">21-day trail — page read and tafseer done.</p>
        <div className="flex flex-col gap-0">
          {recentStudy.map((item) => (
            <div key={item.dateKey} className="flex items-center justify-between py-2.5 border-b border-black/[0.05] last:border-0">
              <div>
                <p className="text-[13px] font-semibold text-[#18231f]">{item.label}</p>
                <p className="text-[11px] text-[#8a9e95] mt-0.5">Page {item.page.page} · {item.page.surah}</p>
              </div>
              <span className={["text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ml-3", item.done ? "bg-[#1f5a46] text-[#f0cb6a]" : "bg-[#faf5eb] text-[#8a9e95]"].join(" ")}>
                {item.done ? "Done" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

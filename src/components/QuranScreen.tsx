import { differenceInCalendarDays, format, subDays } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDateKey, listDates } from "../lib/date";
import type { DailyEntry } from "../types";

interface QuranScreenProps {
  daily: Record<string, DailyEntry>;
  todayEntry: DailyEntry;
  onToggleStudy: () => void;
}

type QuranStartMode = "fatihah" | "nas";

interface QuranApiAyah {
  numberInSurah: number;
  text: string;
  surah: {
    name: string;
    englishName: string;
  };
}

interface QuranApiResponse {
  data?: {
    ayahs?: QuranApiAyah[];
  };
}

function getDaySerial(date: Date) {
  return differenceInCalendarDays(date, new Date(2000, 0, 1));
}

function getDailyQuranPage(
  date: Date,
  startMode: QuranStartMode,
  startAnchorDay: number,
) {
  const elapsedDays = getDaySerial(date) - startAnchorDay;
  const pageOffset = ((elapsedDays % 604) + 604) % 604;

  return startMode === "fatihah" ? pageOffset + 1 : 604 - pageOffset;
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
  onToggleStudy,
}: QuranScreenProps) {
  const quranStudyDone = Boolean(todayEntry.quranStudyDone);
  const todaySerial = getDaySerial(new Date());
  const [startMode, setStartMode] = useState<QuranStartMode>(() => {
    if (typeof window === "undefined") {
      return "fatihah";
    }

    return window.localStorage.getItem("lifestack.quran.startMode") === "nas"
      ? "nas"
      : "fatihah";
  });
  const [startAnchorDay, setStartAnchorDay] = useState<number>(() => {
    if (typeof window === "undefined") {
      return todaySerial;
    }

    const raw = window.localStorage.getItem("lifestack.quran.startAnchorDay");
    const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : todaySerial;
  });
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [arabicPageText, setArabicPageText] = useState("");
  const [translationPageText, setTranslationPageText] = useState("");
  const [surahRangeLabel, setSurahRangeLabel] = useState("");
  const [surahRangeArabicLabel, setSurahRangeArabicLabel] = useState("");

  const todayPageNumber = useMemo(
    () => getDailyQuranPage(new Date(), startMode, startAnchorDay),
    [startAnchorDay, startMode],
  );

  const recentStudy = listDates(21)
    .map((date) => {
      const pageNumber = getDailyQuranPage(date, startMode, startAnchorDay);
      const dateKey = getDateKey(date);

      return {
        dateKey,
        label: format(date, "EEE, d MMM"),
        pageNumber,
        done: Boolean(daily[dateKey]?.quranStudyDone),
      };
    })
    .reverse();
  const completedCount = recentStudy.filter((item) => item.done).length;
  const quranStreak = getQuranStudyStreak(daily);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("lifestack.quran.startMode", startMode);
      window.localStorage.setItem(
        "lifestack.quran.startAnchorDay",
        String(startAnchorDay),
      );
    }
  }, [startAnchorDay, startMode]);

  function handleSwitchStartMode(mode: QuranStartMode) {
    setStartMode(mode);
    // Reset sequence so user immediately starts from page 1 or 604 today.
    setStartAnchorDay(getDaySerial(new Date()));
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchPageContent() {
      setIsLoadingPage(true);
      setLoadError("");

      try {
        const [arabicResponse, translationResponse] = await Promise.all([
          fetch(
            `https://api.alquran.cloud/v1/page/${todayPageNumber}/quran-uthmani`,
          ),
          fetch(`https://api.alquran.cloud/v1/page/${todayPageNumber}/en.asad`),
        ]);

        if (!arabicResponse.ok || !translationResponse.ok) {
          throw new Error("Unable to load Quran page content");
        }

        const arabicPayload = (await arabicResponse.json()) as QuranApiResponse;
        const translationPayload =
          (await translationResponse.json()) as QuranApiResponse;

        const arabicAyahs = arabicPayload.data?.ayahs ?? [];
        const translationAyahs = translationPayload.data?.ayahs ?? [];

        if (arabicAyahs.length === 0 || translationAyahs.length === 0) {
          throw new Error("No ayahs returned for this page");
        }

        const surahNames = Array.from(
          new Set(arabicAyahs.map((ayah) => ayah.surah.englishName)),
        );
        const surahArabicNames = Array.from(
          new Set(arabicAyahs.map((ayah) => ayah.surah.name)),
        );

        const arabicText = arabicAyahs
          .map((ayah) => `${ayah.text} ﴿${ayah.numberInSurah}﴾`)
          .join(" ");
        const translationText = translationAyahs
          .map((ayah) => `${ayah.numberInSurah}. ${ayah.text}`)
          .join(" ");

        if (cancelled) {
          return;
        }

        setArabicPageText(arabicText);
        setTranslationPageText(translationText);
        setSurahRangeLabel(surahNames.join(" • "));
        setSurahRangeArabicLabel(surahArabicNames.join(" • "));
      } catch {
        if (!cancelled) {
          setLoadError(
            "Could not load full page now. Check internet and retry.",
          );
          setArabicPageText("");
          setTranslationPageText("");
          setSurahRangeLabel("");
          setSurahRangeArabicLabel("");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPage(false);
        }
      }
    }

    void fetchPageContent();

    return () => {
      cancelled = true;
    };
  }, [todayPageNumber]);

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* ── HERO ── */}
      <section
        className="rounded-2xl px-5 pt-5 pb-6"
        style={{
          background: "linear-gradient(145deg, #0c1c12 0%, #17372c 85%)",
        }}
      >
        <p className="text-[11px] text-[#6db898] font-bold uppercase tracking-widest mb-2">
          Daily study
        </p>
        <h1 className="text-[1.65rem] font-black text-white leading-tight tracking-tight">
          Quran
        </h1>
        <p className="text-[#6db898] text-sm mt-1">
          One full Quran page every day.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => handleSwitchStartMode("fatihah")}
            className={[
              "text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors",
              startMode === "fatihah"
                ? "bg-[#f0cb6a] text-[#17372c]"
                : "bg-white/[0.08] text-[#6db898] hover:bg-white/[0.14]",
            ].join(" ")}
          >
            Start: Al-Fatihah
          </button>
          <button
            type="button"
            onClick={() => handleSwitchStartMode("nas")}
            className={[
              "text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors",
              startMode === "nas"
                ? "bg-[#f0cb6a] text-[#17372c]"
                : "bg-white/[0.08] text-[#6db898] hover:bg-white/[0.14]",
            ].join(" ")}
          >
            Start: An-Nas
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="font-black text-[#f0cb6a] text-lg leading-none">
                {quranStreak}
              </p>
              <p className="text-[10px] text-[#6db898] mt-0.5">Day streak</p>
            </div>
            <div className="text-center">
              <p className="font-black text-[#f0cb6a] text-lg leading-none">
                {completedCount}
              </p>
              <p className="text-[10px] text-[#6db898] mt-0.5">Last 21 days</p>
            </div>
            <div className="text-center">
              <p className="font-black text-[#f0cb6a] text-lg leading-none">
                {todayPageNumber}
              </p>
              <p className="text-[10px] text-[#6db898] mt-0.5">Today's page</p>
            </div>
          </div>
          <Link
            className="text-[11px] font-semibold text-[#6db898] border border-[#6db898]/30 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] transition-colors"
            to="/stats"
          >
            Stats →
          </Link>
        </div>
      </section>

      {/* ── TODAY'S READING ── */}
      <section
        className={[
          "bg-white border-2 rounded-2xl p-5 transition-colors",
          quranStudyDone ? "border-[#1f5a46]" : "border-black/[0.06]",
        ].join(" ")}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[11px] text-[#657a71] font-bold uppercase tracking-wider">
              Today's reading
            </p>
            <h2 className="font-black text-[#18231f] text-base mt-0.5">
              Page {todayPageNumber}
            </h2>
          </div>
          <span
            className={[
              "text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0",
              quranStudyDone
                ? "bg-[#1f5a46] text-[#f0cb6a]"
                : "bg-[#faf5eb] text-[#657a71]",
            ].join(" ")}
          >
            {quranStudyDone ? "✓ Logged" : "Pending"}
          </span>
        </div>
        <p className="text-[#5d6f65] font-semibold text-sm mb-1">
          {surahRangeLabel || "Loading surah range..."}
        </p>
        {surahRangeArabicLabel ? (
          <p
            className="text-[#18231f] text-base mb-3 quran-mushaf-meta"
            dir="rtl"
            lang="ar"
          >
            {surahRangeArabicLabel}
          </p>
        ) : null}

        {isLoadingPage ? (
          <div className="bg-[#faf5eb] rounded-xl p-4 mb-4">
            <p className="text-[12px] text-[#5d6f65]">
              Loading full page content...
            </p>
          </div>
        ) : loadError ? (
          <div className="bg-[rgba(220,60,60,0.12)] border border-[rgba(220,60,60,0.25)] rounded-xl p-4 mb-4">
            <p className="text-[12px] text-[#ff9090]">{loadError}</p>
          </div>
        ) : (
          <>
            <div className="bg-[#faf5eb] rounded-xl p-3 mb-3 max-h-56 overflow-y-auto">
              <p className="text-[10px] font-bold text-[#657a71] uppercase tracking-wider mb-1">
                Arabic (full page)
              </p>
              <p
                className="text-[#18231f] text-right quran-mushaf-text"
                dir="rtl"
                lang="ar"
              >
                {arabicPageText}
              </p>
            </div>
            <div className="bg-[#faf5eb] rounded-xl p-3 mb-4 max-h-56 overflow-y-auto">
              <p className="text-[10px] font-bold text-[#657a71] uppercase tracking-wider mb-1">
                Translation (full page)
              </p>
              <p className="text-[#5d6f65] text-[13px] leading-relaxed">
                {translationPageText}
              </p>
            </div>
          </>
        )}
        <button
          type="button"
          onClick={onToggleStudy}
          className={[
            "w-full py-3 rounded-xl text-[13px] font-bold transition-all duration-200 active:scale-[0.98]",
            quranStudyDone
              ? "bg-[#1f5a46] text-[#f0cb6a]"
              : "bg-[#17372c] text-white hover:bg-[#1f5a46]",
          ].join(" ")}
        >
          {quranStudyDone ? "✓ Reading logged" : "Mark page + tafseer done"}
        </button>
      </section>

      {/* ── RECENT LOG ── */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
        <h2 className="font-black text-[#18231f] text-base mb-1">
          Recent reading log
        </h2>
        <p className="text-[11px] text-[#657a71] mb-4">
          21-day trail — page read and tafseer done.
        </p>
        <div className="flex flex-col gap-0">
          {recentStudy.map((item) => (
            <div
              key={item.dateKey}
              className="flex items-center justify-between py-2.5 border-b border-black/[0.05] last:border-0"
            >
              <div>
                <p className="text-[13px] font-semibold text-[#18231f]">
                  {item.label}
                </p>
                <p className="text-[11px] text-[#657a71] mt-0.5">
                  Page {item.pageNumber} ·{" "}
                  {startMode === "fatihah" ? "From Al-Fatihah" : "From An-Nas"}
                </p>
              </div>
              <span
                className={[
                  "text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ml-3",
                  item.done
                    ? "bg-[#1f5a46] text-[#f0cb6a]"
                    : "bg-[#faf5eb] text-[#657a71]",
                ].join(" ")}
              >
                {item.done ? "Done" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

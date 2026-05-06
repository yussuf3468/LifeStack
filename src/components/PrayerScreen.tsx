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
    <div className="flex flex-col gap-4 pb-4">
      {/* ── HERO ── */}
      <section
        className="rounded-2xl px-5 pt-5 pb-6"
        style={{
          background: "linear-gradient(145deg, #17372c 0%, #1f5a46 85%)",
        }}
      >
        <p className="text-[11px] text-[#8fd2b5] font-bold uppercase tracking-widest mb-2">
          Daily Prayers
        </p>
        <h1 className="text-[1.65rem] font-black text-white leading-tight tracking-tight">
          Prayers
        </h1>
        <p className="text-[#b8ead3] text-sm mt-1">
          Track today, review misses, and see your 30-day averages.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-3">
            <div className="text-center">
              <p className="font-black text-[#f0cb6a] text-lg leading-none">
                {loggedDays ? `${protectedAverage}/5` : "--"}
              </p>
              <p className="text-[11px] text-[#4d6459] mt-0.5">Avg protected</p>
            </div>
            <div className="text-center">
              <p className="font-black text-[#f0cb6a] text-lg leading-none">
                {perfectDays}
              </p>
              <p className="text-[11px] text-[#4d6459] mt-0.5">Perfect days</p>
            </div>
            <div className="text-center">
              <p className="font-black text-[#f0cb6a] text-lg leading-none">
                {missedTotal}
              </p>
              <p className="text-[11px] text-[#4d6459] mt-0.5">Missed total</p>
            </div>
          </div>
          <Link
            className="text-[11px] font-semibold text-white border border-white/20 px-2.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] transition-colors"
            to="/heatmap"
          >
            Heatmap →
          </Link>
        </div>
      </section>

      {/* ── TODAY'S BOARD ── */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-black text-[#18231f] text-base">
              Today's prayer board
            </h2>
            <p className="text-[12px] text-[#4d6459] mt-0.5">
              Mark each prayer on time.
            </p>
          </div>
          <span
            className={[
              "text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0",
              todayPrayers.filter((p) => p.onTime).length === 5
                ? "bg-[#1f5a46] text-[#f0cb6a]"
                : "bg-[#faf5eb] text-[#5d6f65]",
            ].join(" ")}
          >
            {todayPrayers.filter((p) => p.onTime).length}/5 protected
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {todayPrayers.map((prayer) => (
            <button
              key={prayer.id}
              type="button"
              aria-pressed={prayer.onTime}
              disabled={prayer.onTime}
              onClick={() => onTogglePrayer(prayer.id)}
              className={[
                "flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 shadow-sm transition-all duration-200 active:scale-[0.95] disabled:cursor-default disabled:active:scale-100",
                prayer.onTime
                  ? "bg-[#17372c] border-[#17372c]"
                  : "bg-[#faf5eb] border-[#e8decb] hover:border-[#1f5a46]/40",
              ].join(" ")}
            >
              <span
                className={[
                  "text-[13px] font-black",
                  prayer.onTime ? "text-[#f0cb6a]" : "text-[#18231f]",
                ].join(" ")}
              >
                {prayer.label}
              </span>
              <span
                className={[
                  "text-[10px] font-medium text-center px-2",
                  prayer.onTime ? "text-[#b8ead3]" : "text-[#52665f]",
                ].join(" ")}
              >
                {prayer.onTime ? "✓ On time" : prayer.cue}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── AVERAGE BY PRAYER ── */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
        <h2 className="font-black text-[#18231f] text-base mb-1">
          Average by prayer
        </h2>
        <p className="text-[12px] text-[#4d6459] mb-4">
          Which salah is most exposed over 30 days.
        </p>
        <div className="flex flex-col gap-3">
          {prayerAverages.map((row) => (
            <div key={row.id} className="flex items-center gap-3">
              <span className="text-[12px] font-bold text-[#18231f] w-14 shrink-0">
                {row.label}
              </span>
              <div className="flex-1 h-2 bg-[#f0ede4] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${row.loggedDays ? row.percent : 0}%`,
                    background: "linear-gradient(90deg,#1f5a46,#2f8a67)",
                  }}
                />
              </div>
              <span className="text-[12px] font-black text-[#1f5a46] w-10 text-right shrink-0">
                {row.loggedDays ? `${row.percent}%` : "—"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSED HISTORY ── */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
        <h2 className="font-black text-[#18231f] text-base mb-1">
          Missed prayer history
        </h2>
        <p className="text-[12px] text-[#4d6459] mb-4">
          Last 30 days — specific missed prayers shown.
        </p>
        <div className="flex flex-col gap-2">
          {history.map((row) => (
            <div
              key={row.dateKey}
              className="flex items-center justify-between py-2.5 border-b border-black/[0.05] last:border-0"
            >
              <div>
                <p className="text-[13px] font-semibold text-[#18231f]">
                  {row.label}
                </p>
                <p className="text-[11px] text-[#4d6459] mt-0.5">
                  {row.logged
                    ? row.missed.length === 0
                      ? "All five prayers protected"
                      : `Missed: ${row.missed.map((id) => prayerLabels[id]).join(", ")}`
                    : "No prayer log saved"}
                </p>
              </div>
              <span
                className={[
                  "text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-3",
                  row.logged && row.missed.length === 0
                    ? "bg-[#1f5a46] text-[#f0cb6a]"
                    : row.logged
                      ? "bg-[#faf5eb] text-[#5d6f65]"
                      : "bg-gray-100 text-[#657a71]",
                ].join(" ")}
              >
                {row.logged ? `${row.protectedCount}/5` : "No log"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

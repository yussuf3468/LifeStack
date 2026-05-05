import { useEffect, useState } from "react";
import type { AddictionTracker } from "../types";

interface RecoveryScreenProps {
  tracker: AddictionTracker;
  onLogUrge: () => void;
  onLogRelapse: (note?: string) => void;
  onResetStreak: () => void;
}

function getDaysBetween(isoA: string, isoB: string) {
  const a = new Date(isoA);
  const b = new Date(isoB);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function formatRelativeDate(iso: string) {
  const days = getDaysBetween(iso, new Date().toISOString());
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

const MILESTONES = [1, 3, 7, 14, 21, 30, 60, 90, 180, 365];

function getMilestoneLabel(days: number): string {
  if (days >= 365) return "1 year";
  if (days >= 180) return "6 months";
  if (days >= 90) return "90 days";
  if (days >= 60) return "60 days";
  if (days >= 30) return "30 days";
  if (days >= 21) return "21 days";
  if (days >= 14) return "14 days";
  if (days >= 7) return "1 week";
  if (days >= 3) return "3 days";
  if (days >= 1) return "1 day";
  return "Start";
}

const URGE_RESPONSES = [
  "This urge will pass in 10–20 minutes. Go make wudu.",
  "Lower your gaze. Close the tab. Step away from the screen.",
  "Say Aʿūdhu billāhi min al-Shayṭān al-rajīm and walk out of the room.",
  "Your streak is real progress. This moment is a test, not a verdict.",
  "Stand up. Drink cold water. Change your environment.",
  "Remember: the pleasure is 5 seconds; the shame lasts far longer.",
  "Make two rakʿah and ask for strength. The urge will fade.",
  "Put the phone face-down, walk outside, breathe slowly.",
];

function getUrgeResponse(isoNow: string) {
  const seed = new Date(isoNow).getMinutes() + new Date(isoNow).getSeconds();
  return URGE_RESPONSES[seed % URGE_RESPONSES.length];
}

function getElapsed(cleanSince: string) {
  const start = new Date(cleanSince).getTime();
  const now = Date.now();
  const totalSeconds = Math.max(0, Math.floor((now - start) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function RecoveryScreen({
  tracker,
  onLogUrge,
  onLogRelapse,
  onResetStreak,
}: RecoveryScreenProps) {
  const [elapsed, setElapsed] = useState(() => getElapsed(tracker.cleanSince));

  useEffect(() => {
    setElapsed(getElapsed(tracker.cleanSince));
    const id = setInterval(() => setElapsed(getElapsed(tracker.cleanSince)), 1000);
    return () => clearInterval(id);
  }, [tracker.cleanSince]);

  const daysClean = elapsed.days;
  const nextMilestone = MILESTONES.find((m) => m > daysClean) ?? 365;
  const daysToNext = nextMilestone - daysClean;
  const milestoneReached = getMilestoneLabel(daysClean);
  const urgesLogged = tracker.urges.length;
  const relapseCount = tracker.relapses.length;
  const lastUrge = tracker.urges.at(-1);
  const urgeResponse = lastUrge ? getUrgeResponse(lastUrge) : null;

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* ── HERO ── */}
      <section
        className="rounded-2xl px-5 pt-5 pb-6"
        style={{
          background:
            "linear-gradient(145deg, #1a0f2e 0%, #2d1f4a 50%, #1f1035 100%)",
        }}
      >
        <p className="text-[11px] text-[#c9a0f0] font-bold uppercase tracking-widest mb-2">
          Recovery
        </p>
        <h1 className="text-[1.65rem] font-black text-white leading-tight tracking-tight">
          Breaking Free
        </h1>
        <p className="text-[#c9a0f0] text-sm mt-1">
          Quit pornography and masturbation — one day at a time.
        </p>

        {/* Live timer */}
        <div className="mt-5 flex items-end gap-4">
          <div>
            {tracker.started ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[4rem] font-black text-white leading-none">{elapsed.days}</span>
                  <span className="text-[#c9a0f0] text-lg font-bold">d</span>
                  <span className="text-[2rem] font-black text-white/80 leading-none">{String(elapsed.hours).padStart(2, "0")}</span>
                  <span className="text-[#c9a0f0] text-base font-bold">h</span>
                  <span className="text-[2rem] font-black text-white/80 leading-none">{String(elapsed.minutes).padStart(2, "0")}</span>
                  <span className="text-[#c9a0f0] text-base font-bold">m</span>
                  <span className="text-[1.4rem] font-black text-white/50 leading-none">{String(elapsed.seconds).padStart(2, "0")}</span>
                  <span className="text-[#c9a0f0] text-sm font-bold">s</span>
                </div>
                <p className="text-[#c9a0f0] text-sm font-semibold mt-1">clean and counting</p>
              </>
            ) : (
              <>
                <p className="text-[4rem] font-black text-white leading-none">0</p>
                <p className="text-[#c9a0f0] text-sm font-semibold mt-1">days clean</p>
              </>
            )}
          </div>
          <div className="pb-1.5">
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold"
              style={{
                background: "rgba(201,160,240,0.15)",
                color: "#e8c8ff",
                border: "1px solid rgba(201,160,240,0.3)",
              }}
            >
              {milestoneReached} milestone
            </span>
            {daysToNext <= 365 && (
              <p className="text-[11px] text-[#a07cc8] mt-1.5">
                {daysToNext} {daysToNext === 1 ? "day" : "days"} to{" "}
                {getMilestoneLabel(nextMilestone)}
              </p>
            )}
          </div>
        </div>

        {/* Milestone progress bar */}
        <div className="mt-4">
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.round((daysClean / nextMilestone) * 100))}%`,
                background: "linear-gradient(90deg, #9b59b6, #c9a0f0)",
              }}
            />
          </div>
          <p className="text-[10px] text-[#a07cc8] mt-1">
            {Math.round((daysClean / nextMilestone) * 100)}% to{" "}
            {getMilestoneLabel(nextMilestone)} milestone
          </p>
        </div>

        {!tracker.started && (
          <button
            type="button"
            onClick={onResetStreak}
            className="mt-4 w-full py-3.5 rounded-2xl font-black text-[15px] transition-all active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #c9a0f0)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
            }}
          >
            Begin my journey today →
          </button>
        )}
      </section>

      {/* ── URGE BUTTON ── */}
      <section
        className="rounded-2xl p-5 border"
        style={{
          background: "rgba(255,253,248,0.04)",
          borderColor: "rgba(255,253,248,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <h2
          className="font-black text-base mb-1"
          style={{ color: "rgba(255,253,248,0.92)" }}
        >
          Fighting an urge right now?
        </h2>
        <p
          className="text-[12px] mb-4"
          style={{ color: "rgba(255,253,248,0.5)" }}
        >
          Tap the button. The urge will pass. You are stronger than the
          algorithm.
        </p>

        <button
          type="button"
          onClick={onLogUrge}
          className="w-full py-4 rounded-2xl font-black text-[15px] transition-all duration-200 active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #9b59b6)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
          }}
        >
          🛡️ I'm having an urge — help me resist
        </button>

        {urgeResponse && (
          <div
            className="mt-4 p-4 rounded-xl"
            style={{
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.25)",
            }}
          >
            <p
              className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "#c9a0f0" }}
            >
              Action plan
            </p>
            <p
              className="text-[13px] font-semibold leading-relaxed"
              style={{ color: "rgba(255,253,248,0.88)" }}
            >
              {urgeResponse}
            </p>
          </div>
        )}

        <div
          className="flex gap-4 mt-4 pt-4"
          style={{ borderTop: "1px solid rgba(255,253,248,0.07)" }}
        >
          <div className="text-center flex-1">
            <p
              className="font-black text-lg leading-none"
              style={{ color: "#c9a0f0" }}
            >
              {urgesLogged}
            </p>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "rgba(255,253,248,0.4)" }}
            >
              Urges resisted
            </p>
          </div>
          <div className="text-center flex-1">
            <p
              className="font-black text-lg leading-none"
              style={{ color: "#d3a74d" }}
            >
              {relapseCount === 0 ? "0" : relapseCount}
            </p>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "rgba(255,253,248,0.4)" }}
            >
              Relapses logged
            </p>
          </div>
          <div className="text-center flex-1">
            <p
              className="font-black text-lg leading-none"
              style={{ color: "#6db898" }}
            >
              {daysClean}
            </p>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "rgba(255,253,248,0.4)" }}
            >
              Days clean
            </p>
          </div>
        </div>
      </section>

      {/* ── MILESTONES ── */}
      <section
        className="rounded-2xl p-5 border"
        style={{
          background: "rgba(255,253,248,0.04)",
          borderColor: "rgba(255,253,248,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <h2
          className="font-black text-base mb-1"
          style={{ color: "rgba(255,253,248,0.92)" }}
        >
          Milestones
        </h2>
        <p
          className="text-[12px] mb-4"
          style={{ color: "rgba(255,253,248,0.5)" }}
        >
          Each milestone is a real physiological and spiritual reset.
        </p>
        <div className="grid grid-cols-5 gap-2">
          {MILESTONES.map((milestone) => {
            const reached = daysClean >= milestone;
            const isNext = milestone === nextMilestone;
            return (
              <div
                key={milestone}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all"
                style={{
                  background: reached
                    ? "rgba(124,58,237,0.2)"
                    : isNext
                      ? "rgba(124,58,237,0.08)"
                      : "rgba(255,253,248,0.04)",
                  border: `1px solid ${reached ? "rgba(201,160,240,0.4)" : isNext ? "rgba(124,58,237,0.3)" : "rgba(255,253,248,0.07)"}`,
                }}
              >
                <span className="text-base">
                  {reached ? "✅" : isNext ? "🎯" : "○"}
                </span>
                <p
                  className="text-[10px] font-bold"
                  style={{
                    color: reached
                      ? "#c9a0f0"
                      : isNext
                        ? "#a07cc8"
                        : "rgba(255,253,248,0.35)",
                  }}
                >
                  {milestone < 365 ? `${milestone}d` : "1yr"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ISLAMIC REMINDER ── */}
      <article
        className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, #0c1c12 0%, #17372c 100%)",
        }}
      >
        <p className="text-[11px] text-[#d3a74d] font-bold uppercase tracking-wider mb-2">
          Islamic perspective
        </p>
        <p
          className="text-[18px] leading-relaxed text-right mb-3"
          dir="rtl"
          lang="ar"
          style={{ color: "#f0cb6a" }}
        >
          وَلَا تَقْرَبُوا الزِّنَا ۖ إِنَّهُ كَانَ فَاحِشَةً وَسَاءَ سَبِيلًا
        </p>
        <p
          className="text-[13px] leading-relaxed mb-2"
          style={{ color: "rgba(255,253,248,0.88)" }}
        >
          "And do not approach unlawful sexual intercourse. Indeed, it is ever
          an immorality and is evil as a way." — Quran 17:32
        </p>
        <p
          className="text-[12px] leading-relaxed italic"
          style={{ color: "#6db898" }}
        >
          Pornography and masturbation are widely considered ḥarām. Lowering the
          gaze (ghad al-basr) is the first defence. Fasting, marriage, and
          constant dhikr are the prophet's prescribed remedies for those who
          struggle.
        </p>
      </article>

      {/* ── RESET STREAK / LOG RELAPSE ── */}
      <section
        className="rounded-2xl p-5 border"
        style={{
          background: "rgba(255,253,248,0.04)",
          borderColor: "rgba(255,253,248,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <h2
          className="font-black text-base mb-1"
          style={{ color: "rgba(255,253,248,0.92)" }}
        >
          Log a relapse
        </h2>
        <p
          className="text-[12px] mb-4"
          style={{ color: "rgba(255,253,248,0.5)" }}
        >
          Honesty is the foundation of recovery. Log it, learn from it, restart.
        </p>
        <button
          type="button"
          onClick={() => {
            const confirmed = window.confirm(
              "Log a relapse? This will reset your streak to today. Be honest — it is the only way to measure real progress.",
            );
            if (confirmed) {
              onLogRelapse();
            }
          }}
          className="w-full py-3 rounded-xl font-bold text-[13px] transition-all active:scale-[0.97]"
          style={{
            background: "rgba(220,60,60,0.12)",
            border: "1px solid rgba(220,60,60,0.3)",
            color: "#ff9090",
          }}
        >
          ⚠ I relapsed — reset my streak
        </button>

        {relapseCount > 0 && (
          <div className="mt-4">
            <p
              className="text-[11px] font-bold uppercase tracking-wider mb-2"
              style={{ color: "rgba(255,253,248,0.4)" }}
            >
              Relapse history ({relapseCount})
            </p>
            <div className="flex flex-col gap-2">
              {[...tracker.relapses]
                .reverse()
                .slice(0, 5)
                .map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-xl"
                    style={{
                      background: "rgba(220,60,60,0.08)",
                      border: "1px solid rgba(220,60,60,0.15)",
                    }}
                  >
                    <p
                      className="text-[12px] font-semibold"
                      style={{ color: "rgba(255,253,248,0.7)" }}
                    >
                      {formatRelativeDate(entry.date)}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: "rgba(255,253,248,0.35)" }}
                    >
                      {new Date(entry.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>

      {/* ── TIPS ── */}
      <section
        className="rounded-2xl p-5 border"
        style={{
          background: "rgba(255,253,248,0.04)",
          borderColor: "rgba(255,253,248,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <h2
          className="font-black text-base mb-4"
          style={{ color: "rgba(255,253,248,0.92)" }}
        >
          Practical defences
        </h2>
        <div className="flex flex-col gap-3">
          {[
            {
              icon: "📵",
              title: "No phone in bed",
              body: "Set a physical charging spot outside your bedroom. Most relapses happen at night in bed.",
            },
            {
              icon: "🤲",
              title: "Fast on Mondays & Thursdays",
              body: "The Prophet ﷺ recommended fasting to cool desires. It directly reduces the biological drive.",
            },
            {
              icon: "💪",
              title: "Cold showers",
              body: "A 30-second cold flush after a warm shower reduces arousal hormones rapidly.",
            },
            {
              icon: "📖",
              title: "Surah Al-Mu'minun 1-11",
              body: "The first verses of Al-Mu'minun describe the believers who guard their private parts. Recite morning and night.",
            },
            {
              icon: "🔒",
              title: "Use a content filter",
              body: "Install a DNS-based filter (e.g. CleanBrowsing or NextDNS) on your router and devices. Give someone you trust the password.",
            },
          ].map((tip) => (
            <div
              key={tip.title}
              className="flex gap-3 p-3 rounded-xl"
              style={{
                background: "rgba(255,253,248,0.04)",
                border: "1px solid rgba(255,253,248,0.06)",
              }}
            >
              <span className="text-xl shrink-0 mt-0.5">{tip.icon}</span>
              <div>
                <p
                  className="text-[13px] font-bold mb-0.5"
                  style={{ color: "rgba(255,253,248,0.88)" }}
                >
                  {tip.title}
                </p>
                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: "rgba(255,253,248,0.5)" }}
                >
                  {tip.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

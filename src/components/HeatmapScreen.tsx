import type { CSSProperties } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getHabitCompletionRate,
  getHabitStreak,
  getHeatmapColumns,
} from "../lib/stats";
import type { DailyEntry, Habit } from "../types";

interface HeatmapScreenProps {
  habits: Habit[];
  daily: Record<string, DailyEntry>;
}

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function HeatmapScreen({ habits, daily }: HeatmapScreenProps) {
  const [selectedHabitId, setSelectedHabitId] = useState(habits[0]?.id ?? "");
  const activeHabitId = habits.some((habit) => habit.id === selectedHabitId)
    ? selectedHabitId
    : (habits[0]?.id ?? "");

  const selectedHabit =
    habits.find((habit) => habit.id === activeHabitId) ?? habits[0];

  if (!selectedHabit) {
    return (
      <div className="flex flex-col gap-4 pb-4">
        <div className="flex flex-col items-center py-16 text-center px-6">
          <p className="font-black text-[#18231f] text-xl mb-2">No habits to map yet.</p>
          <p className="text-[13px] text-[#8a9e95] mb-6">Build at least one habit in Habit Manager to unlock the weekly grid.</p>
          <Link
            className="bg-[#17372c] text-white px-5 py-3 rounded-xl text-[13px] font-bold hover:bg-[#1f5a46] transition-colors"
            to="/manager"
          >
            Open Habit Manager
          </Link>
        </div>
      </div>
    );
  }

  const columns = getHeatmapColumns(selectedHabit, daily);
  const completionRate = getHabitCompletionRate(selectedHabit, daily);
  const streak = getHabitStreak(selectedHabit, daily);

  return (
    <div className="flex flex-col gap-4 pb-4">

      {/* ── HERO ── */}
      <section
        className="rounded-2xl px-5 pt-5 pb-6"
        style={{ background: "linear-gradient(145deg, #17372c 0%, #1f5a46 85%)" }}
      >
        <p className="text-[11px] text-[#6db898] font-bold uppercase tracking-widest mb-2">Signal over stories</p>
        <h1 className="text-[1.65rem] font-black text-white leading-tight tracking-tight">Weekly Heatmap</h1>
        <p className="text-[#6db898] text-sm mt-1">GitHub-style consistency per habit so you can see misses without drama.</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="font-black text-[#f0cb6a] text-lg leading-none">{completionRate}%</p>
              <p className="text-[10px] text-[#6db898] mt-0.5">8-week rate</p>
            </div>
            <div className="text-center">
              <p className="font-black text-[#f0cb6a] text-lg leading-none">{streak.current}</p>
              <p className="text-[10px] text-[#6db898] mt-0.5">Current streak</p>
            </div>
            <div className="text-center">
              <p className="font-black text-[#f0cb6a] text-lg leading-none">{streak.longest}</p>
              <p className="text-[10px] text-[#6db898] mt-0.5">Longest streak</p>
            </div>
          </div>
          <Link className="text-[11px] font-semibold text-[#6db898] border border-[#6db898]/30 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] transition-colors" to="/stats">
            Stats →
          </Link>
        </div>
      </section>

      {/* ── HABIT SELECTOR + GRID ── */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="font-black text-[#18231f] text-base">Select a habit</h2>
            <p className="text-[11px] text-[#8a9e95] mt-0.5">Each square is one day in the last eight weeks.</p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#faf5eb] text-[#5d6f65] shrink-0">
            {selectedHabit.icon} {selectedHabit.label}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {habits.map((habit) => (
            <button
              key={habit.id}
              type="button"
              onClick={() => setSelectedHabitId(habit.id)}
              className={["px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all duration-150 active:scale-[0.96]", activeHabitId === habit.id ? "bg-[#17372c] text-white" : "bg-[#faf5eb] text-[#5d6f65] hover:bg-[#f0ede4]"].join(" ")}
            >
              {habit.icon} {habit.label}
            </button>
          ))}
        </div>

        {/* ── HEATMAP GRID ── */}
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="min-w-max">
            {/* Month labels */}
            <div className="flex mb-1 ml-8">
              {columns.map((column, index) => (
                <div key={`label-${index}`} className="w-4 mx-0.5 text-[9px] text-[#8a9e95] font-semibold truncate">
                  {index === 0 || column.label !== columns[index - 1].label ? column.label : ""}
                </div>
              ))}
            </div>

            <div className="flex gap-0.5">
              {/* Day-of-week labels */}
              <div className="flex flex-col justify-around w-7 shrink-0">
                {weekdayLabels.map((label) => (
                  <span key={label} className="text-[9px] text-[#8a9e95] text-right pr-1 leading-none h-4 flex items-center justify-end">{label}</span>
                ))}
              </div>

              {/* Columns */}
              {columns.map((column, index) => (
                <div key={`col-${index}`} className="flex flex-col gap-0.5">
                  {column.days.map((day) => (
                    <div
                      key={day.key}
                      title={`${day.label}: ${day.done ? "done" : day.scheduled ? "scheduled but missed" : "not scheduled"}`}
                      style={
                        day.done
                          ? { background: selectedHabit.accent } as CSSProperties
                          : day.scheduled
                          ? { background: "rgba(24,35,31,0.12)" } as CSSProperties
                          : {}
                      }
                      className={[
                        "w-4 h-4 rounded-[3px] transition-all",
                        day.isToday ? "ring-1 ring-[#f0cb6a] ring-offset-1" : "",
                        day.isFuture ? "opacity-25" : "",
                        !day.done && !day.scheduled ? "bg-[#f0ede4]" : "",
                      ].filter(Boolean).join(" ")}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-[10px] text-[#8a9e95]">Less</span>
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#f0ede4]" />
          <div className="w-3.5 h-3.5 rounded-[3px]" style={{ background: "rgba(24,35,31,0.12)" }} />
          <div className="w-3.5 h-3.5 rounded-[3px]" style={{ background: selectedHabit.accent }} />
          <span className="text-[10px] text-[#8a9e95]">More</span>
        </div>
      </section>

    </div>
  );
}


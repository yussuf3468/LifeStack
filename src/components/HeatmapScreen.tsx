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
      <div className="screen">
        <section className="empty-state">
          <p className="sleep-result">No habits to map yet.</p>
          <p className="helper-copy">
            Build at least one habit in Habit Manager to unlock the weekly grid.
          </p>
          <Link className="primary-button" to="/manager">
            Open Habit Manager
          </Link>
        </section>
      </div>
    );
  }

  const columns = getHeatmapColumns(selectedHabit, daily);
  const completionRate = getHabitCompletionRate(selectedHabit, daily);
  const streak = getHabitStreak(selectedHabit, daily);

  return (
    <div className="screen">
      <header className="screen-header">
        <div className="screen-topline">
          <div>
            <p className="muted">Signal over stories</p>
            <h1 className="screen-title">Weekly Heatmap</h1>
            <p className="screen-copy">
              GitHub-style consistency per habit so you can see misses without
              drama.
            </p>
          </div>
          <Link className="text-link" to="/stats">
            Jump to stats
          </Link>
        </div>
      </header>

      <section className="card heatmap-card">
        <div className="section-row">
          <div>
            <h2 className="section-title">Select a habit</h2>
            <p className="section-subtitle">
              Each square is one day in the last eight weeks.
            </p>
          </div>
          <div className="mini-chip">
            {selectedHabit.icon} {selectedHabit.label}
          </div>
        </div>

        <div className="chip-row">
          {habits.map((habit) => (
            <button
              key={habit.id}
              type="button"
              className={`choice-button${activeHabitId === habit.id ? " is-active" : ""}`}
              onClick={() => setSelectedHabitId(habit.id)}
            >
              {habit.icon} {habit.label}
            </button>
          ))}
        </div>

        <div className="topline-grid">
          <div className="mini-stat">
            <strong>{completionRate}%</strong>
            <span>8-week completion</span>
          </div>
          <div className="mini-stat">
            <strong>{streak.current}</strong>
            <span>Current streak</span>
          </div>
          <div className="mini-stat">
            <strong>{streak.longest}</strong>
            <span>Longest streak</span>
          </div>
        </div>

        <div className="heatmap-wrap">
          <div className="heatmap-months">
            <span></span>
            {columns.map((column, index) => (
              <span key={`${column.label}-${index}`}>
                {index === 0 || column.label !== columns[index - 1].label
                  ? column.label
                  : ""}
              </span>
            ))}
          </div>

          <div className="heatmap-grid">
            <div className="heatmap-labels">
              {weekdayLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            {columns.map((column, index) => (
              <div key={`${column.label}-${index}`} className="heatmap-column">
                {column.days.map((day) => (
                  <div
                    key={day.key}
                    className={[
                      "heatmap-cell",
                      day.scheduled ? "is-scheduled" : "",
                      day.done ? "is-done" : "",
                      day.isToday ? "is-today" : "",
                      day.isFuture ? "is-future" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={
                      {
                        "--habit-accent": selectedHabit.accent,
                      } as CSSProperties
                    }
                    title={`${day.label}: ${day.done ? "done" : day.scheduled ? "scheduled but missed" : "not scheduled"}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="legend-row">
          <span>Less</span>
          <span
            className="legend-box"
            style={{ background: "rgba(24, 35, 31, 0.06)" }}
          />
          <span
            className="legend-box"
            style={{ background: "rgba(24, 35, 31, 0.12)" }}
          />
          <span
            className="legend-box"
            style={{ background: selectedHabit.accent }}
          />
          <span>More</span>
        </div>
      </section>
    </div>
  );
}

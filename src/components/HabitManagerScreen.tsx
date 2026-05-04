import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ACCENT_SWATCHS,
  EMOJI_OPTIONS,
  STARTER_HABIT_TEMPLATES,
} from "../data/content";
import type { Habit, HabitFrequency, HabitInput, Profile } from "../types";

interface HabitManagerScreenProps {
  profile: Profile;
  habits: Habit[];
  onSaveHabit: (habit: HabitInput) => void;
  onDeleteHabit: (habitId: string) => void;
}

const EMPTY_FORM: HabitInput = {
  label: "",
  icon: "🕌",
  frequency: "daily",
  accent: ACCENT_SWATCHS[0],
};

const frequencies: HabitFrequency[] = ["daily", "weekdays", "weekends"];

export function HabitManagerScreen({
  profile,
  habits,
  onSaveHabit,
  onDeleteHabit,
}: HabitManagerScreenProps) {
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState<HabitInput>(EMPTY_FORM);

  function resetForm() {
    setEditingId(undefined);
    setForm(EMPTY_FORM);
  }

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSaveHabit({ ...form, id: editingId });
    resetForm();
  }

  function editHabit(habit: Habit) {
    setEditingId(habit.id);
    setForm({
      label: habit.label,
      icon: habit.icon,
      frequency: habit.frequency,
      accent: habit.accent,
    });
  }

  const canCreate = habits.length < 8 || Boolean(editingId);

  return (
    <div className="screen">
      <header className="screen-header">
        <div className="screen-topline">
          <div>
            <p className="muted">Stack architecture</p>
            <h1 className="screen-title">Habit Manager</h1>
            <p className="screen-copy">
              Keep only the rituals that deserve a home on your daily screen.{" "}
              {profile.name} is capped at eight for a reason.
            </p>
          </div>
          <Link className="text-link" to="/">
            Back to home
          </Link>
        </div>
      </header>

      <div className="form-layout">
        <section className="card form-card">
          <div className="section-row">
            <div>
              <h2 className="section-title">
                {editingId ? "Edit habit" : "Add habit"}
              </h2>
              <p className="section-subtitle">
                Emoji first, label second, frequency third.
              </p>
            </div>
            <div className="mini-chip">{habits.length}/8 habits</div>
          </div>

          <form onSubmit={submitForm}>
            <div className="field">
              <label className="field-label" htmlFor="habit-label">
                Habit label
              </label>
              <input
                id="habit-label"
                className="text-input"
                value={form.label}
                maxLength={24}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    label: event.target.value,
                  }))
                }
                placeholder="Examples: Quran page, Deep work sprint"
              />
            </div>

            <div className="field">
              <span className="field-label">Emoji picker</span>
              <div className="emoji-row">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`emoji-button${form.icon === emoji ? " is-active" : ""}`}
                    onClick={() =>
                      setForm((current) => ({ ...current, icon: emoji }))
                    }
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <span className="field-label">Frequency</span>
              <div className="chip-row">
                {frequencies.map((frequency) => (
                  <button
                    key={frequency}
                    type="button"
                    className={`choice-button${form.frequency === frequency ? " is-active" : ""}`}
                    onClick={() =>
                      setForm((current) => ({ ...current, frequency }))
                    }
                  >
                    {frequency}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <span className="field-label">Accent color</span>
              <div className="swatch-row">
                {ACCENT_SWATCHS.map((accent) => (
                  <button
                    key={accent}
                    type="button"
                    className={`swatch${form.accent === accent ? " is-active" : ""}`}
                    style={{ background: accent }}
                    onClick={() =>
                      setForm((current) => ({ ...current, accent }))
                    }
                    aria-label={`Choose accent ${accent}`}
                  />
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={!canCreate}
              >
                {editingId ? "Update habit" : "Add to stack"}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Reset
              </button>
            </div>

            {!canCreate ? (
              <p className="helper-copy">
                Delete or edit an existing habit before adding another.
              </p>
            ) : null}
          </form>
        </section>

        <section className="card form-card">
          <div className="section-row">
            <div>
              <h2 className="section-title">Starter ideas</h2>
              <p className="section-subtitle">
                Tap any suggestion to preload the form.
              </p>
            </div>
          </div>

          <div className="chip-row">
            {STARTER_HABIT_TEMPLATES.map((habit) => (
              <button
                key={habit.label}
                type="button"
                className="form-chip"
                onClick={() => setForm(habit)}
              >
                {habit.icon} {habit.label}
              </button>
            ))}
          </div>

          <div className="field">
            <span className="field-label">Current stack</span>
            <div className="habit-list">
              {habits.map((habit) => (
                <article key={habit.id} className="habit-list-item">
                  <div className="habit-list-meta">
                    <div
                      className="habit-list-icon"
                      style={{ borderTop: `3px solid ${habit.accent}` }}
                    >
                      {habit.icon}
                    </div>
                    <div>
                      <p className="habit-list-title">{habit.label}</p>
                      <p className="habit-list-copy">{habit.frequency}</p>
                    </div>
                  </div>

                  <div className="actions-row">
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => editHabit(habit)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => onDeleteHabit(habit.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

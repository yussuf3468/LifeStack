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
    <div className="flex flex-col gap-4 pb-4">

      {/* ── HERO ── */}
      <section
        className="rounded-2xl px-5 pt-5 pb-6"
        style={{ background: "linear-gradient(145deg, #17372c 0%, #1f5a46 85%)" }}
      >
        <p className="text-[11px] text-[#6db898] font-bold uppercase tracking-widest mb-2">Stack architecture</p>
        <h1 className="text-[1.65rem] font-black text-white leading-tight tracking-tight">Habit Manager</h1>
        <p className="text-[#6db898] text-sm mt-1">
          Keep only the rituals that deserve a home on your daily screen. {profile.name} is capped at eight for a reason.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[12px] font-bold text-[#f0cb6a]">{habits.length}/8 habits</span>
          <Link className="text-[11px] font-semibold text-[#6db898] border border-[#6db898]/30 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] transition-colors" to="/">
            ← Home
          </Link>
        </div>
      </section>

      {/* ── ADD / EDIT FORM ── */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-black text-[#18231f] text-base">{editingId ? "Edit habit" : "Add habit"}</h2>
            <p className="text-[11px] text-[#8a9e95] mt-0.5">Emoji first, label second, frequency third.</p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#faf5eb] text-[#5d6f65] shrink-0">{habits.length}/8</span>
        </div>

        <form onSubmit={submitForm} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#5d6f65] uppercase tracking-wider" htmlFor="habit-label">Habit label</label>
            <input
              id="habit-label"
              className="w-full border border-black/[0.12] rounded-xl px-3 py-2.5 text-[13px] text-[#18231f] bg-white placeholder:text-[#8a9e95] focus:outline-none focus:border-[#1f5a46] transition-colors"
              value={form.label}
              maxLength={24}
              onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
              placeholder="Examples: Quran page, Deep work sprint"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-[#5d6f65] uppercase tracking-wider">Emoji picker</span>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, icon: emoji }))}
                  className={["w-9 h-9 rounded-xl text-lg transition-all duration-150 active:scale-[0.92]", form.icon === emoji ? "bg-[#17372c] ring-2 ring-[#f0cb6a]" : "bg-[#faf5eb] hover:bg-[#f0ede4]"].join(" ")}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-[#5d6f65] uppercase tracking-wider">Frequency</span>
            <div className="flex gap-2">
              {frequencies.map((frequency) => (
                <button
                  key={frequency}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, frequency }))}
                  className={["flex-1 py-2 rounded-xl text-[12px] font-bold capitalize transition-all duration-150", form.frequency === frequency ? "bg-[#17372c] text-white" : "bg-[#faf5eb] text-[#5d6f65] hover:bg-[#f0ede4]"].join(" ")}
                >
                  {frequency}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-[#5d6f65] uppercase tracking-wider">Accent color</span>
            <div className="flex flex-wrap gap-2">
              {ACCENT_SWATCHS.map((accent) => (
                <button
                  key={accent}
                  type="button"
                  style={{ background: accent }}
                  onClick={() => setForm((current) => ({ ...current, accent }))}
                  aria-label={`Choose accent ${accent}`}
                  className={["w-8 h-8 rounded-full border-2 transition-all duration-150 active:scale-[0.88]", form.accent === accent ? "border-[#18231f] scale-110" : "border-transparent"].join(" ")}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={!canCreate}
              className="flex-1 py-3 rounded-xl text-[13px] font-bold bg-[#17372c] text-white hover:bg-[#1f5a46] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
            >
              {editingId ? "Update habit" : "Add to stack"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-3 rounded-xl text-[13px] font-bold bg-[#faf5eb] text-[#5d6f65] hover:bg-[#f0ede4] transition-all duration-200 active:scale-[0.98]"
            >
              Reset
            </button>
          </div>

          {!canCreate ? (
            <p className="text-[11px] text-[#8a9e95]">Delete or edit an existing habit before adding another.</p>
          ) : null}
        </form>
      </section>

      {/* ── STARTER TEMPLATES ── */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-5">
        <h2 className="font-black text-[#18231f] text-base mb-1">Starter ideas</h2>
        <p className="text-[11px] text-[#8a9e95] mb-4">Tap any suggestion to preload the form.</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {STARTER_HABIT_TEMPLATES.map((habit) => (
            <button
              key={habit.label}
              type="button"
              onClick={() => setForm(habit)}
              className="px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-[#faf5eb] text-[#18231f] hover:bg-[#f0ede4] transition-colors active:scale-[0.96]"
            >
              {habit.icon} {habit.label}
            </button>
          ))}
        </div>

        <div className="border-t border-black/[0.06] pt-4">
          <p className="text-[11px] font-bold text-[#5d6f65] uppercase tracking-wider mb-3">Current stack</p>
          <div className="flex flex-col gap-2">
            {habits.map((habit) => (
              <div key={habit.id} className="flex items-center justify-between bg-[#faf5eb] rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white"
                    style={{ borderTop: `3px solid ${habit.accent}` }}
                  >
                    {habit.icon}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#18231f]">{habit.label}</p>
                    <p className="text-[11px] text-[#8a9e95] capitalize">{habit.frequency}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 ml-2">
                  <button
                    type="button"
                    onClick={() => editHabit(habit)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white text-[#1f5a46] border border-[#1f5a46]/30 hover:border-[#1f5a46] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteHabit(habit.id)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white text-red-600 border border-red-200 hover:border-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

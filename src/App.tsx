import { Suspense, lazy, startTransition, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthScreen } from "./components/AuthScreen";
import { BottomNav } from "./components/BottomNav";
import { HomeScreen } from "./components/HomeScreen";
import {
  BEDTIME_PRESETS,
  DHIKR_GOAL,
  DHIKR_QUICK_STEPS,
  DEV_QUOTES,
  ENERGY_OPTIONS,
  FOCUS_SLOTS,
  MOOD_OPTIONS,
  PRAYER_SLOTS,
  QURAN_STUDY_PAGES,
  QURAN_VERSES,
  WATER_GOAL,
  WAKE_PRESETS,
} from "./data/content";
import {
  calculateSleepHours,
  formatLongDate,
  getDateKey,
  getGreetingLabel,
  pickDailyItem,
} from "./lib/date";
import {
  createDefaultState,
  getStorageKey,
  loadState,
  saveState,
} from "./lib/storage";
import {
  getCurrentAuthIdentity,
  isSupabaseConfigured,
  pullRemoteState,
  pushRemoteState,
  signInWithEmail,
  signOutFromSupabase,
  subscribeToAuthChanges,
} from "./lib/supabase";
import type { AuthIdentity } from "./lib/supabase";
import { getActiveHabits, getXpState } from "./lib/stats";
import type {
  AppState,
  DailyEntry,
  EnergyValue,
  HabitInput,
  MoodValue,
  PrayerName,
} from "./types";

const HabitManagerScreen = lazy(() =>
  import("./components/HabitManagerScreen").then((module) => ({
    default: module.HabitManagerScreen,
  })),
);

const HeatmapScreen = lazy(() =>
  import("./components/HeatmapScreen").then((module) => ({
    default: module.HeatmapScreen,
  })),
);

const StatsScreen = lazy(() =>
  import("./components/StatsScreen").then((module) => ({
    default: module.StatsScreen,
  })),
);

const QuranScreen = lazy(() =>
  import("./components/QuranScreen").then((module) => ({
    default: module.QuranScreen,
  })),
);

const PrayerScreen = lazy(() =>
  import("./components/PrayerScreen").then((module) => ({
    default: module.PrayerScreen,
  })),
);

type BackendStatus =
  | "local"
  | "auth"
  | "connecting"
  | "syncing"
  | "synced"
  | "offline";

type AuthStatus = "checking" | "signed-out" | "signed-in";

function createEmptyEntry(date: string): DailyEntry {
  return {
    date,
    completedHabitIds: [],
    prayers: PRAYER_SLOTS.map((slot) => ({
      id: slot.id,
      onTime: false,
    })),
    dhikrCount: 0,
    quranStudyDone: false,
    waterCups: 0,
    focusItems: FOCUS_SLOTS.map((slot) => ({
      id: slot.id,
      text: "",
      done: false,
    })),
    reflection: "",
    dua: "",
  };
}

function withEntryDefaults(date: string, entry?: DailyEntry): DailyEntry {
  const fallback = createEmptyEntry(date);

  return {
    ...fallback,
    ...entry,
    completedHabitIds: entry?.completedHabitIds ?? [],
    prayers: PRAYER_SLOTS.map((slot) => {
      const existingItem = entry?.prayers?.find((item) => item.id === slot.id);

      return existingItem
        ? {
            id: slot.id,
            onTime: existingItem.onTime,
          }
        : {
            id: slot.id,
            onTime: false,
          };
    }),
    dhikrCount: entry?.dhikrCount ?? 0,
    quranStudyDone: entry?.quranStudyDone ?? false,
    waterCups: entry?.waterCups ?? 0,
    focusItems: FOCUS_SLOTS.map((slot) => {
      const existingItem = entry?.focusItems?.find(
        (item) => item.id === slot.id,
      );

      return existingItem
        ? {
            id: slot.id,
            text: existingItem.text,
            done: existingItem.done,
          }
        : {
            id: slot.id,
            text: "",
            done: false,
          };
    }),
    reflection: entry?.reflection ?? "",
    dua: entry?.dua ?? "",
  };
}

function isRemoteStateNewer(candidate: AppState, baseline: AppState) {
  return (
    new Date(candidate.updatedAt).getTime() >
    new Date(baseline.updatedAt).getTime()
  );
}

function getBackendLabel(status: BackendStatus) {
  switch (status) {
    case "connecting":
      return "Connecting Supabase";
    case "syncing":
      return "Syncing backup";
    case "synced":
      return "Supabase live";
    case "offline":
      return "Supabase paused";
    case "auth":
      return "Secure sign-in required";
    case "local":
    default:
      return "Offline-first local mode";
  }
}

function getAuthErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string") {
      return message === "Invalid login credentials"
        ? "That email and password did not match your Supabase account."
        : message;
    }
  }

  return "Unable to sign in right now. Try again in a moment.";
}

function buildFocusPrompt(
  entry: DailyEntry,
  xpPercent: number,
  habitCount: number,
) {
  if (habitCount === 0) {
    return "Build your first stack in Habit Manager, then the home screen becomes a one-minute ritual.";
  }

  if (!entry.sleep) {
    return "Two taps on sleep gives context before you judge your output.";
  }

  if (!entry.mood) {
    return "Log your mood before the next coding sprint so your stats stay honest.";
  }

  if (xpPercent < 40) {
    return "Momentum is still cheap right now. One habit tap changes the shape of the day.";
  }

  if (xpPercent < 100) {
    return "You are already in motion. Close one more loop with ihsan.";
  }

  return "Daily stack complete. Protect the streak and leave tomorrow a cleaner runway.";
}

function App() {
  const [state, setState] = useState(() =>
    isSupabaseConfigured ? createDefaultState() : loadState(),
  );
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(
    isSupabaseConfigured ? "auth" : "local",
  );
  const [authStatus, setAuthStatus] = useState<AuthStatus>(
    isSupabaseConfigured ? "checking" : "signed-in",
  );
  const [remoteReady, setRemoteReady] = useState(!isSupabaseConfigured);
  const [authIdentity, setAuthIdentity] = useState<AuthIdentity | null>(null);
  const authUserId = authIdentity?.id ?? null;
  const [authDraft, setAuthDraft] = useState({
    email: "",
    password: "",
  });
  const [authError, setAuthError] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const storageKey = isSupabaseConfigured
    ? getStorageKey(authUserId)
    : getStorageKey();

  const todayKey = getDateKey();
  const todayEntry = withEntryDefaults(todayKey, state.daily[todayKey]);
  const [sleepDraft, setSleepDraft] = useState<{
    dateKey: string;
    bedtime?: string;
    wakeTime?: string;
  }>({
    dateKey: todayKey,
  });
  const currentBedtime =
    sleepDraft.dateKey === todayKey && sleepDraft.bedtime !== undefined
      ? sleepDraft.bedtime
      : (todayEntry.sleep?.bedtime ?? "");
  const currentWakeTime =
    sleepDraft.dateKey === todayKey && sleepDraft.wakeTime !== undefined
      ? sleepDraft.wakeTime
      : (todayEntry.sleep?.wakeTime ?? "");

  const activeHabits = getActiveHabits(state.habits);
  const xp = getXpState(state);
  const quote = pickDailyItem(DEV_QUOTES, 2);
  const verse = pickDailyItem(QURAN_VERSES, 7);
  const quranStudy = pickDailyItem(QURAN_STUDY_PAGES, 11);
  const longDate = formatLongDate();
  const greeting = getGreetingLabel(state.profile.name);
  const backendLabel =
    isSupabaseConfigured && authStatus === "checking"
      ? "Checking secure access"
      : getBackendLabel(backendStatus);
  const focusPrompt = buildFocusPrompt(
    todayEntry,
    xp.percent,
    activeHabits.length,
  );
  const isSecureLocked = isSupabaseConfigured && authStatus !== "signed-in";
  const isHydratingSecureState =
    isSupabaseConfigured && authStatus === "signed-in" && !remoteReady;

  useEffect(() => {
    if (isSupabaseConfigured) {
      if (authStatus !== "signed-in" || !authIdentity) {
        return;
      }

      saveState(state, storageKey);
      return;
    }

    saveState(state);
  }, [authIdentity, authStatus, state, storageKey]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let cancelled = false;

    async function hydrateSession() {
      try {
        const identity = await getCurrentAuthIdentity();

        if (cancelled) {
          return;
        }

        setAuthIdentity(identity);
        setAuthStatus(identity ? "signed-in" : "signed-out");
        setBackendStatus(identity ? "connecting" : "auth");
      } catch {
        if (!cancelled) {
          setAuthIdentity(null);
          setAuthStatus("signed-out");
          setBackendStatus("offline");
        }
      }
    }

    hydrateSession();

    const unsubscribe = subscribeToAuthChanges((identity) => {
      if (cancelled) {
        return;
      }

      setAuthIdentity(identity);
      setAuthStatus(identity ? "signed-in" : "signed-out");
      setBackendStatus(identity ? "connecting" : "auth");
      setAuthError("");
      setIsAuthSubmitting(false);
      setAuthDraft((current) => ({
        email: identity?.email ?? current.email,
        password: "",
      }));
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let cancelled = false;

    async function hydrateRemoteState() {
      if (!authUserId) {
        if (!cancelled) {
          setRemoteReady(false);
          startTransition(() => {
            setState(createDefaultState());
          });
        }

        return;
      }

      startTransition(() => {
        setState(loadState(getStorageKey(authUserId)));
      });
      setRemoteReady(false);
      setBackendStatus("connecting");

      try {
        const remoteState = await pullRemoteState();

        if (cancelled) {
          return;
        }

        if (remoteState) {
          startTransition(() => {
            setState((current) =>
              isRemoteStateNewer(remoteState, current) ? remoteState : current,
            );
          });
        }

        setBackendStatus("synced");
      } catch {
        if (!cancelled) {
          setBackendStatus("offline");
        }
      } finally {
        if (!cancelled) {
          setRemoteReady(true);
        }
      }
    }

    hydrateRemoteState();

    return () => {
      cancelled = true;
    };
  }, [authUserId]);

  useEffect(() => {
    if (
      !isSupabaseConfigured ||
      authStatus !== "signed-in" ||
      !authIdentity ||
      !remoteReady
    ) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setBackendStatus("syncing");
        await pushRemoteState(state);
        setBackendStatus("synced");
      } catch {
        setBackendStatus("offline");
      }
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [authIdentity, authStatus, remoteReady, state]);

  function updateState(recipe: (current: AppState) => AppState) {
    setState((current) => ({
      ...recipe(current),
      updatedAt: new Date().toISOString(),
    }));
  }

  function updateTodayEntry(recipe: (current: DailyEntry) => DailyEntry) {
    updateState((current) => {
      const date = getDateKey();
      const entry = withEntryDefaults(date, current.daily[date]);

      return {
        ...current,
        daily: {
          ...current.daily,
          [date]: recipe(entry),
        },
      };
    });
  }

  function handleToggleHabit(habitId: string) {
    updateTodayEntry((entry) => {
      const completedHabitIds = entry.completedHabitIds.includes(habitId)
        ? entry.completedHabitIds.filter(
            (currentHabitId) => currentHabitId !== habitId,
          )
        : [...entry.completedHabitIds, habitId];

      return {
        ...entry,
        completedHabitIds,
      };
    });
  }

  function handleMoodChange(mood: MoodValue) {
    updateTodayEntry((entry) => ({
      ...entry,
      mood,
    }));
  }

  function handleEnergyChange(energy: EnergyValue) {
    updateTodayEntry((entry) => ({
      ...entry,
      energy,
    }));
  }

  function handleTogglePrayer(prayerId: PrayerName) {
    updateTodayEntry((entry) => ({
      ...entry,
      prayers:
        entry.prayers?.map((item) =>
          item.id === prayerId
            ? {
                ...item,
                onTime: !item.onTime,
              }
            : item,
        ) ?? [],
    }));
  }

  function handleAdjustDhikr(delta: number) {
    updateTodayEntry((entry) => ({
      ...entry,
      dhikrCount: Math.max(
        0,
        Math.min(DHIKR_GOAL, (entry.dhikrCount ?? 0) + delta),
      ),
    }));
  }

  function handleResetDhikr() {
    updateTodayEntry((entry) => ({
      ...entry,
      dhikrCount: 0,
    }));
  }

  function handleToggleQuranStudy() {
    updateTodayEntry((entry) => ({
      ...entry,
      quranStudyDone: !entry.quranStudyDone,
    }));
  }

  function handleWaterCupsChange(value: number) {
    updateTodayEntry((entry) => ({
      ...entry,
      waterCups: Math.max(0, Math.min(WATER_GOAL, value)),
    }));
  }

  function handleFocusItemTextChange(focusId: string, text: string) {
    updateTodayEntry((entry) => ({
      ...entry,
      focusItems:
        entry.focusItems?.map((item) =>
          item.id === focusId
            ? {
                ...item,
                text,
              }
            : item,
        ) ?? [],
    }));
  }

  function handleToggleFocusItem(focusId: string) {
    updateTodayEntry((entry) => ({
      ...entry,
      focusItems:
        entry.focusItems?.map((item) =>
          item.id === focusId
            ? {
                ...item,
                done: !item.done,
              }
            : item,
        ) ?? [],
    }));
  }

  function handleDailyNoteChange(field: "reflection" | "dua", value: string) {
    updateTodayEntry((entry) => ({
      ...entry,
      [field]: value,
    }));
  }

  function handleSleepSelection(kind: "bedtime" | "wakeTime", value: string) {
    setSleepDraft((current) => {
      const base =
        current.dateKey === todayKey
          ? current
          : {
              dateKey: todayKey,
            };
      const next = {
        ...base,
        [kind]: value,
      };
      const nextBedtime = next.bedtime ?? todayEntry.sleep?.bedtime ?? "";
      const nextWakeTime = next.wakeTime ?? todayEntry.sleep?.wakeTime ?? "";

      if (nextBedtime && nextWakeTime) {
        updateTodayEntry((entry) => ({
          ...entry,
          sleep: {
            bedtime: nextBedtime,
            wakeTime: nextWakeTime,
            hours: calculateSleepHours(nextBedtime, nextWakeTime),
          },
        }));
      }

      return next;
    });
  }

  function clearSleepLog() {
    setSleepDraft({ dateKey: todayKey, bedtime: "", wakeTime: "" });

    updateTodayEntry((entry) => ({
      ...entry,
      sleep: undefined,
    }));
  }

  function handleSaveHabit(habit: HabitInput) {
    const label = habit.label.trim();

    if (!label) {
      return;
    }

    updateState((current) => {
      if (habit.id) {
        return {
          ...current,
          habits: current.habits.map((currentHabit) =>
            currentHabit.id === habit.id
              ? {
                  ...currentHabit,
                  label,
                  icon: habit.icon,
                  frequency: habit.frequency,
                  accent: habit.accent,
                }
              : currentHabit,
          ),
        };
      }

      if (current.habits.length >= 8) {
        return current;
      }

      return {
        ...current,
        habits: [
          ...current.habits,
          {
            id: crypto.randomUUID(),
            label,
            icon: habit.icon,
            frequency: habit.frequency,
            accent: habit.accent,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    });
  }

  function handleDeleteHabit(habitId: string) {
    updateState((current) => {
      const cleanedDaily = Object.fromEntries(
        Object.entries(current.daily).map(([date, entry]) => [
          date,
          {
            ...entry,
            completedHabitIds: entry.completedHabitIds.filter(
              (currentHabitId) => currentHabitId !== habitId,
            ),
          },
        ]),
      );

      return {
        ...current,
        habits: current.habits.filter((habit) => habit.id !== habitId),
        daily: cleanedDaily,
      };
    });
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = authDraft.email.trim();
    const password = authDraft.password;

    if (!email || !password) {
      setAuthError("Email and password are both required.");
      return;
    }

    setIsAuthSubmitting(true);
    setAuthError("");

    try {
      await signInWithEmail(email, password);
      setAuthDraft((current) => ({
        ...current,
        password: "",
      }));
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
      setIsAuthSubmitting(false);
      setBackendStatus("auth");
    }
  }

  async function handleSignOut() {
    try {
      await signOutFromSupabase();
      setState(createDefaultState());
      setRemoteReady(false);
    } catch {
      setBackendStatus("offline");
    }
  }

  return (
    <HashRouter>
      <div className="app-shell">
        <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-two" aria-hidden="true" />

        <header className="global-header page-width">
          <div className="brand-block">
            <div className="brand-mark">LS</div>
            <div>
              <p className="brand-title">LifeStack</p>
              <p className="brand-subtitle">
                One-minute check-ins for soul, study, and stamina
              </p>
            </div>
          </div>
          <div className="header-actions">
            {authIdentity?.email ? (
              <div className="status-badge account-badge">
                {authIdentity.email}
              </div>
            ) : null}
            <div className="status-badge">{backendLabel}</div>
            {authIdentity ? (
              <button
                type="button"
                className="ghost-button header-button"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            ) : null}
          </div>
        </header>

        <main className="page-width page-main">
          {isSecureLocked ? (
            authStatus === "checking" ? (
              <section className="card quick-card">
                <h2 className="section-title">Checking secure access</h2>
                <p className="helper-copy">Restoring your signed-in session.</p>
              </section>
            ) : (
              <AuthScreen
                email={authDraft.email}
                password={authDraft.password}
                errorMessage={authError}
                isSubmitting={isAuthSubmitting}
                onEmailChange={(value) =>
                  setAuthDraft((current) => ({ ...current, email: value }))
                }
                onPasswordChange={(value) =>
                  setAuthDraft((current) => ({ ...current, password: value }))
                }
                onSubmit={handleSignIn}
              />
            )
          ) : isHydratingSecureState ? (
            <section className="card quick-card">
              <h2 className="section-title">Unlocking your stack</h2>
              <p className="helper-copy">
                Loading your saved state and secure backup.
              </p>
            </section>
          ) : (
            <Suspense
              fallback={
                <section className="card quick-card">
                  <h2 className="section-title">Loading</h2>
                  <p className="helper-copy">Preparing your next view.</p>
                </section>
              }
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomeScreen
                      profile={state.profile}
                      greeting={greeting}
                      longDate={longDate}
                      quote={quote}
                      verse={verse}
                      quranStudy={quranStudy}
                      focusPrompt={focusPrompt}
                      backendLabel={backendLabel}
                      activeHabits={activeHabits}
                      todayEntry={todayEntry}
                      xp={xp}
                      energyOptions={ENERGY_OPTIONS}
                      focusSlots={FOCUS_SLOTS}
                      prayerSlots={PRAYER_SLOTS}
                      dhikrGoal={DHIKR_GOAL}
                      dhikrQuickSteps={DHIKR_QUICK_STEPS}
                      waterGoal={WATER_GOAL}
                      bedtimePresets={BEDTIME_PRESETS}
                      wakeTimePresets={WAKE_PRESETS}
                      currentBedtime={currentBedtime}
                      currentWakeTime={currentWakeTime}
                      moodOptions={MOOD_OPTIONS}
                      onEnergyChange={handleEnergyChange}
                      onTogglePrayer={handleTogglePrayer}
                      onAdjustDhikr={handleAdjustDhikr}
                      onResetDhikr={handleResetDhikr}
                      onToggleQuranStudy={handleToggleQuranStudy}
                      onWaterCupsChange={handleWaterCupsChange}
                      onFocusItemTextChange={handleFocusItemTextChange}
                      onToggleFocusItem={handleToggleFocusItem}
                      onDailyNoteChange={handleDailyNoteChange}
                      onToggleHabit={handleToggleHabit}
                      onMoodChange={handleMoodChange}
                      onSleepSelection={handleSleepSelection}
                      onClearSleep={clearSleepLog}
                    />
                  }
                />
                <Route
                  path="/quran"
                  element={
                    <QuranScreen
                      daily={state.daily}
                      todayEntry={todayEntry}
                      studyPage={quranStudy}
                      onToggleStudy={handleToggleQuranStudy}
                    />
                  }
                />
                <Route
                  path="/prayers"
                  element={
                    <PrayerScreen
                      daily={state.daily}
                      todayEntry={todayEntry}
                      prayerSlots={PRAYER_SLOTS}
                      onTogglePrayer={handleTogglePrayer}
                    />
                  }
                />
                <Route
                  path="/manager"
                  element={
                    <HabitManagerScreen
                      profile={state.profile}
                      habits={state.habits}
                      onSaveHabit={handleSaveHabit}
                      onDeleteHabit={handleDeleteHabit}
                    />
                  }
                />
                <Route
                  path="/heatmap"
                  element={
                    <HeatmapScreen habits={state.habits} daily={state.daily} />
                  }
                />
                <Route
                  path="/stats"
                  element={
                    <StatsScreen habits={state.habits} daily={state.daily} />
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          )}
        </main>

        {!isSecureLocked && !isHydratingSecureState ? (
          <div className="page-width nav-wrap">
            <BottomNav />
          </div>
        ) : null}
      </div>
    </HashRouter>
  );
}

export default App;

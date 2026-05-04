import {
  Suspense,
  lazy,
  startTransition,
  useEffect,
  useRef,
  useState,
} from "react";
import type { FormEvent } from "react";
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthScreen } from "./components/AuthScreen";
import { BottomNav } from "./components/BottomNav";
import { ToastContainer } from "./components/ToastContainer";
import { toast } from "./lib/toast";
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

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
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
  const stateRef = useRef(state);
  const authStatusRef = useRef(authStatus);
  const remoteReadyRef = useRef(remoteReady);
  const authIdentityRef = useRef(authIdentity);

  stateRef.current = state;
  authStatusRef.current = authStatus;
  remoteReadyRef.current = remoteReady;
  authIdentityRef.current = authIdentity;

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

  useEffect(() => {
    function flushStateOnBackground() {
      const snapshot = stateRef.current;
      saveState(snapshot, storageKey);

      if (
        !isSupabaseConfigured ||
        authStatusRef.current !== "signed-in" ||
        !authIdentityRef.current ||
        !remoteReadyRef.current
      ) {
        return;
      }

      void pushRemoteState(snapshot).catch(() => {
        setBackendStatus("offline");
      });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        flushStateOnBackground();
      }
    }

    window.addEventListener("beforeunload", flushStateOnBackground);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", flushStateOnBackground);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [storageKey]);

  function updateState(recipe: (current: AppState) => AppState) {
    const next = {
      ...recipe(stateRef.current),
      updatedAt: new Date().toISOString(),
    };

    stateRef.current = next;
    saveState(next, storageKey);
    setState(next);
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
      const isAdding = !entry.completedHabitIds.includes(habitId);
      const completedHabitIds = isAdding
        ? [...entry.completedHabitIds, habitId]
        : entry.completedHabitIds.filter(
            (currentHabitId) => currentHabitId !== habitId,
          );

      if (
        isAdding &&
        activeHabits.length > 0 &&
        activeHabits.every((h) => completedHabitIds.includes(h.id))
      ) {
        queueMicrotask(() => {
          toast.success("All Habits Complete!", "Stack sealed for today 🔥");
        });
      }

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
    updateTodayEntry((entry) => {
      const newPrayers =
        entry.prayers?.map((item) =>
          item.id === prayerId ? { ...item, onTime: !item.onTime } : item,
        ) ?? [];

      const wasAllDone = (entry.prayers ?? []).every((p) => p.onTime);
      const isAllDone =
        newPrayers.length === 5 && newPrayers.every((p) => p.onTime);

      if (!wasAllDone && isAllDone) {
        queueMicrotask(() => {
          toast.islamic(
            "All 5 Prayers Complete",
            "الحمد لله",
            "May Allah accept your salah",
          );
        });
      }

      return { ...entry, prayers: newPrayers };
    });
  }

  function handleAdjustDhikr(delta: number) {
    updateTodayEntry((entry) => {
      const prev = entry.dhikrCount ?? 0;
      const next = Math.max(0, Math.min(DHIKR_GOAL, prev + delta));

      if (prev < DHIKR_GOAL && next >= DHIKR_GOAL) {
        queueMicrotask(() => {
          toast.islamic(
            "Dhikr Goal Reached!",
            "سبحان الله",
            "100 remembrances completed",
          );
        });
      }

      return { ...entry, dhikrCount: next };
    });
  }

  function handleResetDhikr() {
    updateTodayEntry((entry) => ({
      ...entry,
      dhikrCount: 0,
    }));
  }

  function handleToggleQuranStudy() {
    if (!todayEntry.quranStudyDone) {
      queueMicrotask(() => {
        toast.islamic(
          "Quran Study Complete",
          "بارك الله فيك",
          "Reading recorded for today",
        );
      });
    }
    updateTodayEntry((entry) => ({
      ...entry,
      quranStudyDone: !entry.quranStudyDone,
    }));
  }

  function handleWaterCupsChange(value: number) {
    const prev = todayEntry.waterCups ?? 0;
    if (prev < WATER_GOAL && value >= WATER_GOAL) {
      queueMicrotask(() => {
        toast.success(
          "Hydration Goal Reached!",
          `${WATER_GOAL} cups — body fueled 💧`,
        );
      });
    }
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
    updateTodayEntry((entry) => {
      const isCompleting = !(
        entry.focusItems?.find((i) => i.id === focusId)?.done ?? false
      );
      const newFocusItems =
        entry.focusItems?.map((item) =>
          item.id === focusId ? { ...item, done: !item.done } : item,
        ) ?? [];

      const filled = newFocusItems.filter((i) => i.text?.trim());
      if (isCompleting && filled.length > 0 && filled.every((i) => i.done)) {
        queueMicrotask(() => {
          toast.success("Focus Blocks Done!", "Deep work logged 🎯");
        });
      }

      return { ...entry, focusItems: newFocusItems };
    });
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
      toast.islamic(
        `Welcome back, ${email.split("@")[0]}`,
        "بسم الله",
        "Your stack is loading…",
      );
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
      <ScrollToTop />
      <div className="app-shell">
        <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-two" aria-hidden="true" />

        <header
          className="sticky top-0 z-40 border-b border-[rgba(255,253,248,0.07)]"
          style={{
            background: "rgba(10,22,15,0.92)",
            backdropFilter: "blur(24px) saturate(1.4)",
            WebkitBackdropFilter: "blur(24px) saturate(1.4)",
            paddingTop: "env(safe-area-inset-top, 0px)",
          }}
        >
          <div className="page-width flex items-center justify-between px-4 h-16">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[#d3a74d] text-[11px] font-black tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #d3a74d, #b8882e)",
                  boxShadow: "0 2px 10px rgba(211,167,77,0.35)",
                }}
              >
                LS
              </div>
              <div className="leading-none">
                <p className="font-bold text-[rgba(255,253,248,0.92)] text-sm tracking-tight m-0 leading-tight">
                  LifeStack
                </p>
                <p className="text-[10px] text-[rgba(255,253,248,0.45)] mt-0.5 m-0 leading-tight">
                  Soul · Study · Stamina
                </p>
              </div>
            </div>

            {/* Status + sign-out */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-500 ${
                    backendStatus === "synced"
                      ? "bg-[#2f8a67]"
                      : backendStatus === "syncing" ||
                          backendStatus === "connecting"
                        ? "bg-[#2f8a67] animate-pulse"
                        : backendStatus === "offline"
                          ? "bg-amber-400"
                          : "bg-[rgba(255,253,248,0.2)]"
                  }`}
                  title={backendLabel}
                />
                <span className="hidden sm:block text-[10px] text-[rgba(255,253,248,0.45)] font-medium max-w-[140px] truncate">
                  {backendLabel}
                </span>
              </div>
              {authIdentity ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-[11px] font-semibold text-[rgba(255,253,248,0.55)] hover:text-[#f0cb6a] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[rgba(255,253,248,0.06)] active:scale-95"
                >
                  Sign out
                </button>
              ) : null}
            </div>
          </div>
        </header>

        <main className="page-width page-main px-1 sm:px-0">
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

        {!isSecureLocked && !isHydratingSecureState ? <BottomNav /> : null}

        <ToastContainer />
      </div>
    </HashRouter>
  );
}

export default App;

import { createClient } from "@supabase/supabase-js";
import { hydrateState } from "./storage";
import type { AppState, DailyEntry } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  : null;

export interface AuthIdentity {
  id: string;
  email: string;
}

function isMissingDailyEntriesRelation(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    code?: unknown;
    message?: unknown;
  };

  return (
    candidate.code === "42P01" ||
    candidate.code === "PGRST205" ||
    (typeof candidate.message === "string" &&
      candidate.message.includes("daily_entries") &&
      (candidate.message.includes("not found") ||
        candidate.message.includes("does not exist")))
  );
}

async function pullDailyEntries(userId: string) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("daily_entries")
    .select("entry_date, payload")
    .eq("user_id", userId)
    .order("entry_date", { ascending: true });

  if (error) {
    if (isMissingDailyEntriesRelation(error)) {
      return null;
    }

    throw error;
  }

  const rows = (data ?? []) as Array<{
    entry_date: string;
    payload: DailyEntry;
  }>;

  return Object.fromEntries(
    rows.map((row) => [row.entry_date, row.payload] as const),
  );
}

async function pushDailyEntries(
  userId: string,
  daily: Record<string, DailyEntry>,
  updatedAt: string,
) {
  if (!supabase) {
    return;
  }

  const rows = Object.values(daily).map((entry) => ({
    user_id: userId,
    entry_date: entry.date,
    payload: entry,
    updated_at: updatedAt,
  }));

  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("daily_entries")
    .upsert(rows, { onConflict: "user_id,entry_date" });

  if (error && !isMissingDailyEntriesRelation(error)) {
    throw error;
  }
}

function toAuthIdentity(user: { id: string; email?: string | null } | null) {
  if (!user?.id || !user.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  } satisfies AuthIdentity;
}

export async function getCurrentAuthIdentity() {
  if (!supabase) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return toAuthIdentity(session?.user ?? null);
}

export function subscribeToAuthChanges(
  callback: (identity: AuthIdentity | null) => void,
) {
  if (!supabase) {
    return () => undefined;
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(toAuthIdentity(session?.user ?? null));
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return toAuthIdentity(data.user ?? null);
}

export async function signOutFromSupabase() {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

async function ensureUserId() {
  const identity = await getCurrentAuthIdentity();
  return identity?.id ?? null;
}

export async function pullRemoteState() {
  if (!supabase) {
    return null;
  }

  const userId = await ensureUserId();

  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, faith, timezone, app_state, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const profileState = data?.app_state ? hydrateState(data.app_state) : null;
  const dailyEntries = await pullDailyEntries(userId);

  if (!profileState && !dailyEntries) {
    return null;
  }

  return hydrateState({
    ...(profileState ?? {}),
    profile: profileState?.profile ?? {
      name: data?.display_name ?? "",
      faith: data?.faith ?? "Muslim",
      timezone: data?.timezone ?? "UTC",
    },
    habits: profileState?.habits ?? [],
    daily: dailyEntries ?? profileState?.daily ?? {},
    updatedAt:
      profileState?.updatedAt ??
      (typeof data?.updated_at === "string"
        ? data.updated_at
        : new Date().toISOString()),
  });
}

export async function pushRemoteState(state: AppState) {
  if (!supabase) {
    return false;
  }

  const userId = await ensureUserId();

  if (!userId) {
    return false;
  }

  await pushDailyEntries(userId, state.daily, state.updatedAt);

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      display_name: state.profile.name,
      faith: state.profile.faith,
      timezone: state.profile.timezone,
      app_state: state,
      updated_at: state.updatedAt,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }

  return true;
}

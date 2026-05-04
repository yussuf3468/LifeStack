export type ToastVariant = "success" | "info" | "warning" | "error" | "islamic";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  arabic?: string;
  duration: number;
}

type Subscriber = (items: readonly ToastItem[]) => void;

let items: ToastItem[] = [];
const subscribers = new Set<Subscriber>();

function broadcast(): void {
  const snapshot = Object.freeze([...items]);
  subscribers.forEach((fn) => fn(snapshot));
}

function dismiss(id: string): void {
  items = items.filter((t) => t.id !== id);
  broadcast();
}

function show(options: Omit<ToastItem, "id">): string {
  const id = Math.random().toString(36).slice(2, 9);
  items = [...items.slice(-2), { ...options, id }]; // max 3 at once
  broadcast();
  setTimeout(() => dismiss(id), options.duration);
  return id;
}

export function subscribeToasts(fn: Subscriber): () => void {
  subscribers.add(fn);
  fn(Object.freeze([...items]));
  return () => {
    subscribers.delete(fn);
  };
}

export const toast = {
  success(title: string, message?: string): string {
    return show({ variant: "success", title, message, duration: 4000 });
  },
  info(title: string, message?: string): string {
    return show({ variant: "info", title, message, duration: 4000 });
  },
  warning(title: string, message?: string): string {
    return show({ variant: "warning", title, message, duration: 5000 });
  },
  error(title: string, message?: string): string {
    return show({ variant: "error", title, message, duration: 6000 });
  },
  islamic(title: string, arabic?: string, message?: string): string {
    return show({ variant: "islamic", title, arabic, message, duration: 5000 });
  },
  dismiss,
};

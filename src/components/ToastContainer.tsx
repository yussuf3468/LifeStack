import { useEffect, useState } from "react";
import {
  type ToastItem,
  subscribeToasts,
  toast as toastLib,
} from "../lib/toast";

const VARIANT_ICON: Record<ToastItem["variant"], string> = {
  success: "✓",
  info: "i",
  warning: "!",
  error: "✕",
  islamic: "☽",
};

function ToastCard({ item }: { item: ToastItem }) {
  const [leaving, setLeaving] = useState(false);

  function handleDismiss() {
    setLeaving(true);
    setTimeout(() => toastLib.dismiss(item.id), 300);
  }

  return (
    <div
      className={`toast toast--${item.variant}${leaving ? " toast--leaving" : ""}`}
      style={
        { "--toast-duration": `${item.duration}ms` } as React.CSSProperties
      }
      role="alert"
      aria-live="polite"
      onClick={handleDismiss}
    >
      <div className="toast-stripe" />
      <div className="toast-body">
        <div className="toast-icon-wrap">
          <span className="toast-icon">{VARIANT_ICON[item.variant]}</span>
        </div>
        <div className="toast-content">
          {item.arabic && <p className="toast-arabic">{item.arabic}</p>}
          <p className="toast-title">{item.title}</p>
          {item.message && <p className="toast-message">{item.message}</p>}
        </div>
        <button
          className="toast-close"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <div className="toast-progress" />
    </div>
  );
}

export function ToastContainer() {
  const [items, setItems] = useState<readonly ToastItem[]>([]);

  useEffect(() => subscribeToasts(setItems), []);

  if (items.length === 0) return null;

  return (
    <div className="toast-portal" aria-label="Notifications" aria-live="polite">
      {items.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  );
}

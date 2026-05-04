import type { CSSProperties } from "react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Today", icon: "⚡", end: true },
  { to: "/quran", label: "Quran", icon: "📖" },
  { to: "/prayers", label: "Prayers", icon: "🕌" },
  { to: "/manager", label: "Habits", icon: "🧩" },
  { to: "/stats", label: "Stats", icon: "📈" },
];

export function BottomNav() {
  return (
    <nav
      className="nav-shell"
      aria-label="Primary"
      style={{ "--nav-count": items.length } as CSSProperties}
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          <span aria-hidden="true">{item.icon}</span>
          <strong>{item.label}</strong>
        </NavLink>
      ))}
    </nav>
  );
}

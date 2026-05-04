import type React from "react";
import { NavLink } from "react-router-dom";

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 22, height: 22, display: "block" }}
    >
      <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 22, height: 22, display: "block" }}
    >
      <path d="M12 6C12 6 9 4.5 5.5 4.5C4 4.5 3 5 3 5V20C3 20 4 19.5 5.5 19.5C9 19.5 12 21 12 21V6Z" />
      <path d="M12 6C12 6 15 4.5 18.5 4.5C20 4.5 21 5 21 5V20C21 20 20 19.5 18.5 19.5C15 19.5 12 21 12 21V6Z" />
    </svg>
  );
}

function CrescentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 22, height: 22, display: "block" }}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function ChecklistIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 22, height: 22, display: "block" }}
    >
      <path d="M9 11L12 14L22 4" />
      <path d="M21 12V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H16" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 22, height: 22, display: "block" }}
    >
      <path d="M18 20V10M12 20V4M6 20V14" />
    </svg>
  );
}

const NAV_ITEMS: Array<{
  to: string;
  label: string;
  end?: boolean;
  Icon: () => React.JSX.Element;
}> = [
  { to: "/", label: "Today", end: true, Icon: HomeIcon },
  { to: "/quran", label: "Quran", Icon: BookIcon },
  { to: "/prayers", label: "Prayers", Icon: CrescentIcon },
  { to: "/manager", label: "Habits", Icon: ChecklistIcon },
  { to: "/stats", label: "Stats", Icon: BarChartIcon },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pointer-events-none"
      style={{
        paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        className="flex items-center w-full max-w-[440px] gap-1 px-2 py-2 pointer-events-auto rounded-[28px] border border-[rgba(255,253,248,0.1)]"
        style={{
          background: "rgba(10,22,15,0.94)",
          backdropFilter: "blur(28px) saturate(1.6)",
          WebkitBackdropFilter: "blur(28px) saturate(1.6)",
          boxShadow:
            "0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {NAV_ITEMS.map(({ to, label, end, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 rounded-[20px] transition-all duration-200 select-none no-underline",
                isActive
                  ? "text-[#f0cb6a]"
                  : "text-[rgba(255,253,248,0.4)] hover:text-[rgba(255,253,248,0.7)]",
              ].join(" ")
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background: "#17372c",
                    boxShadow:
                      "0 2px 12px rgba(23,55,44,0.38), inset 0 1px 0 rgba(255,255,255,0.08)",
                  }
                : {}
            }
          >
            <Icon />
            <span className="text-[10px] font-bold tracking-wide leading-none mt-0.5">
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

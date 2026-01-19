import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./appShell.css";

const THEME_STORAGE_KEY = "archero2_theme";
const MODE_STORAGE_KEY = "archero2_theme_mode";
const THEME_OPTIONS = [
  { id: "sea-glass", label: "Sea Glass" },
  { id: "guild-ledger", label: "Guild Ledger" },
  { id: "signal-flare", label: "Signal Flare" },
];
let historyMaxCache = typeof window !== "undefined" ? Number(window.history.state?.idx ?? 0) : 0;
let historyMinCache: number | null = typeof window !== "undefined" ? Number(window.history.state?.idx ?? 0) : null;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const prefersDark = useMemo(
    () => (typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false),
    []
  );
  const [themeId, setThemeId] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) ?? "sea-glass");
  const [mode, setMode] = useState(() => localStorage.getItem(MODE_STORAGE_KEY) ?? (prefersDark ? "dark" : "light"));
  const initialIdx = typeof window !== "undefined" ? Number(window.history.state?.idx ?? 0) : 0;
  if (historyMinCache === null) {
    historyMinCache = initialIdx;
  }
  const [historyIndex, setHistoryIndex] = useState(initialIdx);
  const [historyMaxIndex, setHistoryMaxIndex] = useState(Math.max(initialIdx, historyMaxCache));

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
    document.documentElement.dataset.mode = mode;
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [themeId, mode]);

  useEffect(() => {
    const idx = Number(window.history.state?.idx ?? 0);
    setHistoryIndex(idx);
    setHistoryMaxIndex((prev) => {
      const next = idx > prev ? idx : prev;
      historyMaxCache = Math.max(historyMaxCache, next);
      return next;
    });
  }, [location.key]);

  const canGoBack = historyIndex > (historyMinCache ?? 0);
  const canGoForward = historyIndex < historyMaxIndex;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const active = document.activeElement;
      if (!(active instanceof HTMLSelectElement)) return;
      if (event.target instanceof Node && active.contains(event.target)) return;
      active.blur();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div className="app">
      <header className="appHeader">
        <div className="appHeaderInner">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  if (canGoBack) window.history.back();
                }}
                aria-label="Go back"
                disabled={!canGoBack}
              >
                ←
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  if (canGoForward) window.history.forward();
                }}
                aria-label="Go forward"
                disabled={!canGoForward}
              >
                →
              </button>
            </div>
            <Link to="/" className="brand">
              Archero 2 Event Companion
            </Link>
          </div>

          <div className="headerRight">
            <nav className="nav">
              <Link to="/search" className="navLink">
                Search
              </Link>
              <Link to="/credits" className="navLink">
                Credits
              </Link>
              <Link to="/about" className="navLink">
                About
              </Link>
            </nav>
            <div className="themeControls">
              <select
                value={themeId}
                onChange={(e) => {
                  setThemeId(e.target.value);
                  window.setTimeout(() => e.currentTarget.blur(), 0);
                }}
                aria-label="Theme"
              >
                {THEME_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={(e) => {
                  setMode((prev) => (prev === "light" ? "dark" : "light"));
                  e.currentTarget.blur();
                }}
              >
                {mode === "light" ? "Dark" : "Light"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="appMain">
        <div className="container">{children}</div>
      </main>
    </div>
  );
}

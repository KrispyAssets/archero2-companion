import React from "react";
import "./tabs.css";

export type TabDef = {
  id: string;
  label: string;
  hidden?: boolean;
  content: React.ReactNode;
};

export default function Tabs({ tabs }: { tabs: TabDef[] }) {
  const visibleTabs = tabs.filter((t) => !t.hidden);
  const [activeId, setActiveId] = React.useState(visibleTabs[0]?.id ?? "");

  const active = visibleTabs.find((t) => t.id === activeId) ?? visibleTabs[0];

  return (
    <div>
      <div className="tabsRow" role="tablist">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            className={`tabButton ${t.id === activeId ? "active" : ""}`}
            onClick={() => setActiveId(t.id)}
            type="button"
            role="tab"
            aria-selected={t.id === activeId}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="tabPanel" role="tabpanel">
        {active?.content}
      </div>
    </div>
  );
}

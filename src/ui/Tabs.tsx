import React, { useEffect } from "react";
import "./tabs.css";

export type TabDef = {
  id: string;
  label: string;
  hidden?: boolean;
  content: React.ReactNode;
};

export default function Tabs({
  tabs,
  initialActiveId,
  activeId,
  onActiveIdChange,
}: {
  tabs: TabDef[];
  initialActiveId?: string;
  activeId?: string;
  onActiveIdChange?: (id: string) => void;
}) {
  const visibleTabs = tabs.filter((t) => !t.hidden);
  const [internalActiveId, setInternalActiveId] = React.useState(initialActiveId ?? visibleTabs[0]?.id ?? "");
  const isControlled = activeId !== undefined;
  const currentActiveId = isControlled ? activeId : internalActiveId;

  const active = visibleTabs.find((t) => t.id === currentActiveId) ?? visibleTabs[0];

  useEffect(() => {
    if (isControlled) return;
    const hasActive = visibleTabs.some((tab) => tab.id === internalActiveId);
    if (!hasActive && initialActiveId) {
      setInternalActiveId(initialActiveId);
    }
  }, [initialActiveId, internalActiveId, isControlled, visibleTabs]);

  return (
    <div>
      <div className="tabsRow" role="tablist">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            className={`tabButton ${t.id === currentActiveId ? "active" : ""}`}
            onClick={() => {
              if (!isControlled) setInternalActiveId(t.id);
              onActiveIdChange?.(t.id);
            }}
            type="button"
            role="tab"
            aria-selected={t.id === currentActiveId}
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

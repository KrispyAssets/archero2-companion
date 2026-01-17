import { useMemo, useState } from "react";
import type { TaskDefinition } from "../../catalog/types";
import { getEventProgressState, upsertTaskState } from "../../state/userStateStore";

function formatRequirement(t: TaskDefinition): string {
  return `${t.requirementAction} ${t.requirementTargetValue} ${t.requirementObject} (${t.requirementScope})`;
}

function formatReward(t: TaskDefinition): string {
  return `Reward: ${t.rewardAmount} ${t.rewardType}`;
}

export default function TasksTracker(props: { eventId: string; eventVersion: number; tasks: TaskDefinition[] }) {
  const { eventId, eventVersion, tasks } = props;

  const [tick, setTick] = useState(0);

  const progressState = useMemo(() => {
    void tick;
    return getEventProgressState(eventId, eventVersion);
  }, [eventId, eventVersion, tick]);

  function bumpProgress(taskId: string, delta: number, target: number) {
    upsertTaskState(eventId, eventVersion, taskId, (prev) => {
      const nextVal = Math.max(0, Math.min(target, prev.progressValue + delta));
      const isCompleted = nextVal >= target ? true : prev.flags.isCompleted;
      return { progressValue: nextVal, flags: { ...prev.flags, isCompleted } };
    });
    setTick((x) => x + 1);
  }

  function setCompleted(taskId: string, value: boolean) {
    upsertTaskState(eventId, eventVersion, taskId, (prev) => ({
      ...prev,
      flags: { ...prev.flags, isCompleted: value },
    }));
    setTick((x) => x + 1);
  }

  function setClaimed(taskId: string, value: boolean) {
    upsertTaskState(eventId, eventVersion, taskId, (prev) => ({
      ...prev,
      flags: { ...prev.flags, isClaimed: value },
    }));
    setTick((x) => x + 1);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {tasks.map((t) => {
        const state = progressState.tasks[t.taskId] ?? {
          progressValue: 0,
          flags: { isCompleted: false, isClaimed: false },
        };

        const pct = t.requirementTargetValue > 0 ? Math.round((state.progressValue / t.requirementTargetValue) * 100) : 0;

        return (
          <div
            key={t.taskId}
            id={`task-${t.taskId}`}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 12,
              background: "#fff",
              scrollMarginTop: 90,
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 6 }}>{formatRequirement(t)}</div>
            <div style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>{formatReward(t)}</div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ fontSize: 13 }}>
                Progress: <b>{state.progressValue}</b> / {t.requirementTargetValue} ({pct}%)
              </div>

              <button type="button" onClick={() => bumpProgress(t.taskId, -1, t.requirementTargetValue)}>
                -1
              </button>
              <button type="button" onClick={() => bumpProgress(t.taskId, +1, t.requirementTargetValue)}>
                +1
              </button>
              <button type="button" onClick={() => bumpProgress(t.taskId, +5, t.requirementTargetValue)}>
                +5
              </button>
              <button type="button" onClick={() => bumpProgress(t.taskId, +10, t.requirementTargetValue)}>
                +10
              </button>

              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="checkbox" checked={state.flags.isCompleted} onChange={(e) => setCompleted(t.taskId, e.target.checked)} />
                Completed
              </label>

              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="checkbox" checked={state.flags.isClaimed} onChange={(e) => setClaimed(t.taskId, e.target.checked)} />
                Claimed
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}

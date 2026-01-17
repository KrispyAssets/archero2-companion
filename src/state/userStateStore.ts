export type TaskFlags = {
  isCompleted: boolean;
  isClaimed: boolean;
};

export type TaskState = {
  progressValue: number; // 0..target
  flags: TaskFlags;
};

export type EventProgressState = {
  eventId: string;
  eventVersion: number;
  tasks: Record<string, TaskState>; // taskId -> state
};

const STORAGE_KEY = "archero2_event_companion_user_state_v1";

type RootState = {
  schemaVersion: 1;
  events: Record<string, EventProgressState>; // eventKey -> state
};

function makeEventKey(eventId: string, eventVersion: number): string {
  return `${eventId}::v${eventVersion}`;
}

function loadRootState(): RootState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { schemaVersion: 1, events: {} };

  try {
    const parsed = JSON.parse(raw) as RootState;
    if (parsed.schemaVersion !== 1) return { schemaVersion: 1, events: {} };
    return parsed;
  } catch {
    return { schemaVersion: 1, events: {} };
  }
}

function saveRootState(state: RootState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getEventProgressState(eventId: string, eventVersion: number): EventProgressState {
  const root = loadRootState();
  const key = makeEventKey(eventId, eventVersion);

  const existing = root.events[key];
  if (existing) return existing;

  const created: EventProgressState = {
    eventId,
    eventVersion,
    tasks: {},
  };

  root.events[key] = created;
  saveRootState(root);
  return created;
}

export function upsertTaskState(eventId: string, eventVersion: number, taskId: string, updater: (prev: TaskState) => TaskState): TaskState {
  const root = loadRootState();
  const key = makeEventKey(eventId, eventVersion);

  const ev =
    root.events[key] ??
    ({
      eventId,
      eventVersion,
      tasks: {},
    } as EventProgressState);

  const prev: TaskState = ev.tasks[taskId] ?? { progressValue: 0, flags: { isCompleted: false, isClaimed: false } };

  const next = updater(prev);
  ev.tasks[taskId] = next;
  root.events[key] = ev;

  saveRootState(root);
  return next;
}

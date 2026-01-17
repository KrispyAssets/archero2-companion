import { useMemo } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../ui/AppShell";
import Tabs from "../ui/Tabs";
import TasksTracker from "../ui/components/TasksTracker";
import { useEventCatalog } from "../catalog/useEventCatalog";

export default function EventDetail() {
  const { eventId } = useParams();

  const decodedEventId = useMemo(() => {
    try {
      return eventId ? decodeURIComponent(eventId) : "";
    } catch {
      return eventId ?? "";
    }
  }, [eventId]);

  const eventState = useEventCatalog(decodedEventId);

  if (eventState.status === "idle" || eventState.status === "loading") {
    return (
      <AppShell>
        <h1>Event</h1>
        <p>Loading event…</p>
      </AppShell>
    );
  }

  if (eventState.status === "error") {
    return (
      <AppShell>
        <h1>Event</h1>
        <p style={{ color: "crimson" }}>Error: {eventState.error}</p>
      </AppShell>
    );
  }

  const ev = eventState.event;

  const tabs = [
    {
      id: "tasks",
      label: `Tasks (${ev.sections.taskCount})`,
      content: <TasksTracker eventId={ev.eventId} eventVersion={ev.eventVersion} tasks={ev.tasks} />,
    },
    {
      id: "guide",
      label: `Guide (${ev.sections.guideSectionCount})`,
      content: <p>Guide playbook will be implemented next.</p>,
    },
    {
      id: "faq",
      label: `FAQ (${ev.sections.faqCount})`,
      content: <p>FAQ list will be implemented next.</p>,
    },
    {
      id: "tools",
      label: `Tools (${ev.sections.toolCount})`,
      hidden: ev.sections.toolCount === 0,
      content: <p>Tools host will be implemented next.</p>,
    },
  ];

  return (
    <AppShell>
      <h1>{ev.title}</h1>
      {ev.subtitle ? <p>{ev.subtitle}</p> : null}
      {ev.lastVerifiedDate ? <p style={{ fontSize: 13 }}>Last verified: {ev.lastVerifiedDate}</p> : null}

      <Tabs tabs={tabs} />
    </AppShell>
  );
}

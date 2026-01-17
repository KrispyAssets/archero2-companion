import { useEffect, useState } from "react";
import { loadCatalogIndex, loadEventById } from "./loadCatalog";
import type { EventCatalogFull } from "./types";

type EventState = { status: "idle" } | { status: "loading" } | { status: "error"; error: string } | { status: "ready"; event: EventCatalogFull };

export function useEventCatalog(eventId: string | null | undefined): EventState {
  const [state, setState] = useState<EventState>({ status: "idle" });

  useEffect(() => {
    if (!eventId) return;

    const id = eventId;
    let cancelled = false;

    async function run() {
      try {
        setState({ status: "loading" });
        const index = await loadCatalogIndex();
        const ev = await loadEventById(index.eventPaths, id);

        if (cancelled) return;

        if (!ev) {
          setState({ status: "error", error: `Event not found: ${id}` });
          return;
        }

        setState({ status: "ready", event: ev });
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        setState({ status: "error", error: msg });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return state;
}

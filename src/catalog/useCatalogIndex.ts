import { useEffect, useState } from "react";
import { loadCatalogIndex, loadEventSummaries } from "./loadCatalog";
import type { EventCatalogItemFull } from "./types";

type CatalogIndexState = { status: "loading" } | { status: "error"; error: string } | { status: "ready"; events: EventCatalogItemFull[] };

let cached: CatalogIndexState | null = null;

export function useCatalogIndex(): CatalogIndexState {
  const [state, setState] = useState<CatalogIndexState>(cached ?? { status: "loading" });

  useEffect(() => {
    if (cached?.status === "ready" || cached?.status === "error") return;

    let cancelled = false;

    async function run() {
      try {
        const index = await loadCatalogIndex();
        const events = await loadEventSummaries(index.eventPaths);
        cached = { status: "ready", events };
        if (!cancelled) setState(cached);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        cached = { status: "error", error: msg };
        if (!cancelled) setState(cached);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

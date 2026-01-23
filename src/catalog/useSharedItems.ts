import { useEffect, useState } from "react";
import { loadCatalogIndex, loadSharedItems } from "./loadCatalog";
import type { SharedItem } from "./types";

type SharedItemsState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; items: Record<string, SharedItem> };

let cached: SharedItemsState | null = null;

export function useSharedItems(): SharedItemsState {
  const [state, setState] = useState<SharedItemsState>(cached ?? { status: "loading" });

  useEffect(() => {
    if (cached?.status === "ready" || cached?.status === "error") return;

    let cancelled = false;

    async function run() {
      try {
        const index = await loadCatalogIndex();
        const items = await loadSharedItems(index.sharedPaths);
        cached = { status: "ready", items };
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

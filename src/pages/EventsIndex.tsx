import AppShell from "../ui/AppShell";
import { Link } from "react-router-dom";
import { useCatalogIndex } from "../catalog/useCatalogIndex";

export function EventCatalogList() {
  const catalog = useCatalogIndex();

  return (
    <>
      {catalog.status === "loading" && <p>Loading catalog…</p>}
      {catalog.status === "error" && <p style={{ color: "crimson" }}>Error: {catalog.error}</p>}

      {catalog.status === "ready" && (
        <>
          <div style={{ display: "grid", gap: 12 }}>
            {catalog.events.map((ev) => (
              <Link
                key={ev.eventId}
                to={`/event/${encodeURIComponent(ev.eventId)}`}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, background: "var(--surface)" }}>
                  <div style={{ fontWeight: 700 }}>{ev.title}</div>
                  {ev.subtitle ? <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{ev.subtitle}</div> : null}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default function EventsIndex() {
  return (
    <AppShell>
      <h1>Events</h1>
      <EventCatalogList />
    </AppShell>
  );
}

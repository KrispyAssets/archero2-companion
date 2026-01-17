import AppShell from "../ui/AppShell";
import { Link } from "react-router-dom";
import { useCatalogIndex } from "../catalog/useCatalogIndex";

export default function EventsIndex() {
  const catalog = useCatalogIndex();

  return (
    <AppShell>
      <h1>Events</h1>

      {catalog.status === "loading" && <p>Loading catalog…</p>}
      {catalog.status === "error" && <p style={{ color: "crimson" }}>Error: {catalog.error}</p>}

      {catalog.status === "ready" && (
        <>
          <p>Loaded {catalog.events.length} event(s).</p>
          <ul>
            {catalog.events.map((ev) => (
              <li key={ev.eventId}>
                <Link to={`/event/${encodeURIComponent(ev.eventId)}`}>{ev.title}</Link>
                {ev.subtitle ? <div style={{ fontSize: 13 }}>{ev.subtitle}</div> : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </AppShell>
  );
}

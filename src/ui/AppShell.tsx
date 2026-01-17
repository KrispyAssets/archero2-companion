import { Link } from "react-router-dom";
import "./appShell.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <header className="appHeader">
        <div className="appHeaderInner">
          <Link to="/" className="brand">
            Archero 2 Event Companion
          </Link>

          <nav className="nav">
            <Link to="/search" className="navLink">
              Search
            </Link>
            <Link to="/about" className="navLink">
              About
            </Link>
          </nav>
        </div>
      </header>

      <main className="appMain">
        <div className="container">{children}</div>
      </main>
    </div>
  );
}

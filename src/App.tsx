import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ContentIndex from "./pages/ContentIndex";
import EventsIndex from "./pages/EventsIndex";
import EventDetail from "./pages/EventDetail";
import SearchPage from "./pages/SearchPage";
import AboutPage from "./pages/AboutPage";
import CreditsPage from "./pages/CreditsPage";

const BASENAME = import.meta.env.BASE_URL;

export default function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <Routes>
        <Route path="/" element={<ContentIndex />} />
        <Route path="/events" element={<Navigate to="/" replace />} />
        <Route path="/event/:eventId" element={<EventDetail />} />
        <Route path="/event" element={<Navigate to="/events" replace />} />
        <Route path="/event/*" element={<Navigate to="/" replace />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

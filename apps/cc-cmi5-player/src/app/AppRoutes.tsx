import AuManager from './session/AuManager';
import CourseModals from './components/CourseModals';
import NoAuManager from './session/NoAuManager';
import { BrowserRouter as Router } from 'react-router';

export default function AppRoutes() {
  const searchParams = new URLSearchParams(window.location.search);
  const hasConsoleTab = searchParams.get('console') || '';

  return (
    <Router>
      <div
        id="app"
        className="flex h-screen w-screen"
        style={{ backgroundColor: 'black' }}
      >
        {hasConsoleTab && <NoAuManager />}
        {!hasConsoleTab && <AuManager />}
        <CourseModals />
      </div>
    </Router>
  );
}

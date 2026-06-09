import AuManager from './session/AuManager';
import CourseModals from './components/CourseModals';
import NoAuManager from './session/NoAuManager';
import { BrowserRouter as Router } from 'react-router';

// Must match output.publicPath in webpack.config.js (without trailing slash)
// so relative fetches (e.g. ../RC5.yaml) resolve against the test course layout.
const TEST_MODE_BASENAME = '/course/blocks/name/au';

export default function AppRoutes() {
  const searchParams = new URLSearchParams(window.location.search);
  const hasConsoleTab = searchParams.get('console');
  const isTestMode = searchParams.get('fetch') === 'test';

  return (
    <Router basename={isTestMode ? TEST_MODE_BASENAME : undefined}>
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

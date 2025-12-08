import { GitContextProvider } from '../course-builder/GitViewer/session/GitContext';
import { RC5ContextProvider } from './contexts/RC5Context';
import RC5Modals from './modals/RC5Modals';
import Landing from './Landing';

/**
 * Routes for Rapid CMI5 Editor
 */

export function RapidCmi5Route({ isElectron }: { isElectron: boolean }) {
  return (
    <GitContextProvider isElectron={isElectron}>
      <RC5ContextProvider>
        <Landing />
        <RC5Modals />
      </RC5ContextProvider>
    </GitContextProvider>
  );
}

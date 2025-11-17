/*
 * Routes for Console Tab (deployed console)
 */
import { Route } from 'react-router';

/* Constants */
import { ConsoleTab } from './ConsoleTab';

export const ConsoleTabRoutes = [
  <Route
    key="console"
    path={'/console/:connectionId/:rangeId/:scenarioId'}
    element={<ConsoleTab />}
  ></Route>,
];

export default ConsoleTabRoutes;

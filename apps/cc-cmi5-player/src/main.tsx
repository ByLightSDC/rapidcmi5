import * as ReactDOM from 'react-dom/client';
import AppWrapper from './app/AppWrapper';
import { config } from '@rangeos-nx/frontend/environment';
import { worker } from './mocks/browser';
import { http } from 'msw';
import { store } from './app/redux/store';
import './assets/fonts/stylesheet.css';
import './styles.css';
import './app/components/player/rc5-styles.css';
import { debugLog } from './app/debug';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    msw: any;
    store: any;
  }
}

// Expose methods globally to make them available in integration tests
async function enableMocking() {
  if (config.CYPRESS === true) {
    window.store = store;
  }

  if (config.MSW_MOCK === true) {
    debugLog('[main]  MOCK ', true);
    window.msw = { worker, http };
    return worker.start();
  }

  return Promise.resolve();
}

// wait for MSW set up before render
enableMocking().then(() => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
  );
  root.render(<AppWrapper />);
});

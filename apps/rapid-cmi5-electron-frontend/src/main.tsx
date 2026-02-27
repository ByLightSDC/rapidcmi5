import * as ReactDOM from 'react-dom/client';
import AppWrapper from './app/AppWrapper';
import { fsApi, ipc } from '@rapid-cmi5/react-editor';

import './styles.css';
import './assets/fonts/stylesheet.css';

declare global {
  interface Window {
    msw: any;
    store: any;
    ipc: ipc;
    fsApi: fsApi;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // this merges with the existing intrinsic elements, adding 'my-custom-tag' and its props
    interface IntrinsicElements {
      mytag: { title: string; children: any };
    }
  }
}

// Expose methods globally to make them available in integration tests
async function enableMocking() {
  return Promise.resolve();
}

// wait for MSW set up before render
enableMocking().then(() => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
  );
  root.render(<AppWrapper />);
});

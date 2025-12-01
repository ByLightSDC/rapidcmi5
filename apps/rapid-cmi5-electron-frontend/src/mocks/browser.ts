/* Mock Endpoints */
import { cmi5Class } from './cmi5Class';
import { setupWorker } from 'msw/browser';

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(
  ...cmi5Class,

);

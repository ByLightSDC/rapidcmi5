/* Mock Endpoints */
import { setupWorker } from 'msw/browser';
import { testMock } from './testMock';

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...testMock);

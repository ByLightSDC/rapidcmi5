/* Mock Endpoints */
import { setupWorker } from 'msw/browser';
import { lessonContent } from './lessonContent';

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...lessonContent);

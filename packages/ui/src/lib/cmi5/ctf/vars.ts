import { signal } from '@preact/signals-react';

// whether answer should be scored
export const shouldCheckAnswer$ = signal(false);
// whether input is enabled (disabled when graded = success)
export const isAnswerInputEnabled$ = signal(false);
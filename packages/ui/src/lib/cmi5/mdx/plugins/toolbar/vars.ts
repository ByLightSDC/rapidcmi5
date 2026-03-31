import { signal } from '@preact/signals-react';

/**
 * Slide Width
 */
export const maxSlideWidth$ = signal<number | null>(null);

/**
 * Toolbar Rect
 */
export const toolbarRect$ = signal<DOMRect | null>(null);
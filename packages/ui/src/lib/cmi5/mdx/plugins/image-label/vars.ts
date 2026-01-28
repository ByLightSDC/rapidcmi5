import { signal } from '@preact/signals-react';

/**
 * Maps image IDs to an open image label
 *
 * - Key: image ID (string)
 * - Value: label ID (string) or `null` if no label is open
 *
 * Used to track label ↔ image associations during labeling workflows.
 */
export const imageLabelKeys$ = signal<Record<string, string | null>>({});

/**
 * Indicates whether a label is currently being dragged/dropped.
 *
 * Used to control UI state such as hover targets, drop indicators,
 * and preventing conflicting interactions while dropping.
 */
export const isLabelDropping$ = signal<boolean>(false);

/**
 * Stores the last click position within the image
 *
 * Format: [x, y]
 * - x: horizontal coordinate (pixels)
 * - y: vertical coordinate (pixels)
 *
 * A value of [-1, -1] indicates no valid click has occurred yet.
 */
export const clickPosition$ = signal<number[]>([-1, -1]);

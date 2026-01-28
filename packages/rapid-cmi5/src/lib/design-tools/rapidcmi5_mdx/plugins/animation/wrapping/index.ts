/**
 * Animation Wrapping Module (Refactored)
 *
 * Exports utilities for selecting and wrapping content with animation directives
 *
 * NEW: Uses wrapSelectionOrBlock pattern from InsertLayoutBox

 */

// Core utilities
export { SelectionValidator } from './SelectionValidator';
export { DirectiveWrapper } from './DirectiveWrapper';

// Types
export type { SelectionInfo, ValidationResult } from './types/Selection.types';

export type {
  WrapOptions,
  WrapResult,
  SupportedMdastContent,
} from './types/Wrapping.types';

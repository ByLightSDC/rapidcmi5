/**
 * Phase 5.1: Animation Wrapping Module
 *
 * Exports utilities for selecting and wrapping content with animation directives
 */

// Core utilities
export { SelectionValidator } from './SelectionValidator';
export { MdastExtractor } from './MdastExtractor';
export { DirectiveWrapper } from './DirectiveWrapper';

// Types
export type {
  SelectionInfo,
  ValidationResult,
} from './types/Selection.types';

export type {
  WrapOptions,
  WrapResult,
  SupportedMdastContent,
} from './types/Wrapping.types';

/**
 * Phase 5.1: Selection Analysis Types
 */

import type { LexicalNode } from 'lexical';

/**
 * Result of selection analysis
 */
export interface SelectionInfo {
  /** Whether the selection is valid for wrapping */
  isValid: boolean;

  /** Reason why selection is invalid (if applicable) */
  reason?: string;

  /** Suggestion for user on how to fix (if applicable) */
  suggestion?: string;

  /** Selected Lexical nodes */
  nodes: LexicalNode[];

  /** Node types of selected nodes */
  nodeTypes: string[];

  /** Whether selection contains nested directives */
  hasNesting: boolean;

  /** Whether selection can be wrapped */
  canWrap: boolean;

  /** Start offset in selection (for partial selections) */
  startOffset?: number;

  /** End offset in selection (for partial selections) */
  endOffset?: number;
}

/**
 * Validation result from SelectionValidator
 */
export interface ValidationResult {
  /** Whether the selection is valid for wrapping */
  isValid: boolean;

  /** Reason why selection is invalid (if applicable) */
  reason?: string;

  /** Helpful suggestion for the user */
  suggestion?: string;
}

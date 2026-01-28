/**
 * Wrapping Types
 */

import type * as Mdast from 'mdast';

/**
 * Options for wrapping selection
 */
export interface WrapOptions {
  /** ID for the animation directive */
  directiveId: string;

  /** Whether to validate for nested directives */
  validateNesting?: boolean;

  /** Whether to preserve selection after wrapping */
  preserveSelection?: boolean;
}

/**
 * Result of wrapping operation
 */
export interface WrapResult {
  /** Whether wrapping succeeded */
  success: boolean;

  /** The directive ID that was created */
  directiveId?: string;

  /** The Lexical node key of the wrapped directive */
  targetNodeKey?: string;

  /** Error message if wrapping failed */
  error?: string;
}

/**
 * MDAST content types we support extracting
 */
export type SupportedMdastContent =
  | Mdast.Paragraph
  | Mdast.Heading
  | Mdast.Image
  | Mdast.HTML // For video/audio
  | Mdast.Text
  | Mdast.Strong
  | Mdast.Emphasis
  | Mdast.InlineCode;

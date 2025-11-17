import { Cell } from '@mdxeditor/editor';
import { createCommand } from 'lexical';
import {
  iFootnoteDefinitionEditorDescriptor,
  iFootnoteReferenceEditorDescriptor,
} from './types';

// reference keys
export const fnRefs$ = Cell<{ [key: string]: string }>({});
// ordered references
export const fnRefOrder$ = Cell<string[]>([]);
// inline hyperlink url (different bw cmi5 player and range os because cmi5 player has no routing)
export const fnUrl$ = Cell<string | null>('/design_tools/rapid_cmi5_mdx');

/**
 * Slide content updated event
 */
export const CONTENT_UPDATED_COMMAND = createCommand<undefined>(
  'CONTENT_UPDATED_COMMAND',
);

/**
 * Currently registered footnote definition descriptors
 * @group Footnote
 */
export const footnoteDefinitionEditorDescriptors$ = Cell<
  iFootnoteDefinitionEditorDescriptor[]
>([]);

/**
 * Contains the currently registered footnote definition descriptors.
 * @group Footnote
 */
export const footnoteReferenceEditorDescriptors$ = Cell<
  iFootnoteReferenceEditorDescriptor[]
>([]);

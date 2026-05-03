import { FootnoteReferenceEditor } from './FootnoteReferenceEditor';
import { type iFootnoteReferenceEditorDescriptor } from './types';

/**
 * Footnote Reference Descriptor
 */
export const FootnoteReferenceDescriptor: iFootnoteReferenceEditorDescriptor = {
  priority: -10,
  match: (_) => true,
  Editor: FootnoteReferenceEditor,
};

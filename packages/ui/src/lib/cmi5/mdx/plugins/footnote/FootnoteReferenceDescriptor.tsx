import { FootnoteReferenceEditor } from './FootnoteReferenceEditor';
import { iFootnoteReferenceEditorDescriptor } from './types';

/**
 * Footnote Reference Descriptor
 */
export const FootnoteReferenceDescriptor: iFootnoteReferenceEditorDescriptor = {
  priority: -10,
  match: (_) => true,
  Editor: FootnoteReferenceEditor,
};

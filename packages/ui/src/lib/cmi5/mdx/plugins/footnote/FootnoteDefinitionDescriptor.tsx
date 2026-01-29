import { iFootnoteDefinitionEditorDescriptor } from './types';
import { FootnoteDefinitionEditor } from './FootnoteDefinitionEditor';

/**
 * Footnote Definition Descriptor
 */
export const FootnoteDefinitionDescriptor: iFootnoteDefinitionEditorDescriptor =
  {
    priority: -10,
    match: (_) => true,
    Editor: FootnoteDefinitionEditor,
  };

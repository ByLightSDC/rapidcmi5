import { useCellValue } from '@mdxeditor/editor';

import { useMemo } from 'react';

import { fnRefOrder$, fnUrl$ } from './vars';
import { FootnoteRefEditorProps } from './types';

/**
 * MDX Editor for Footnote Reference
 * When user selects text and inserts a footnote
 * The selected text becomes the label of a footnote reference
 * The label is hidden
 * Autonumbering is applied and a number is displayed
 * @param param0
 * @returns
 */
export const FootnoteReferenceEditor: React.FC<FootnoteRefEditorProps> = ({
  config,
  label,
  lexicalNode,
}) => {
  const fnUrl = useCellValue(fnUrl$);
  const fnRefOrder = useCellValue(fnRefOrder$);

  /**
   * Autonumbering to display based on where the reference is in relation to other
   * references in the same document
   */
  const theCounter = useMemo(() => {
    return fnRefOrder.indexOf(lexicalNode.getKey()) + 1;
  }, [fnRefOrder, lexicalNode]);

  return (
    <a
      href={`${fnUrl}#fn:${label}`}
      className="footnote"
      rel="footnote"
      role="doc-noteref"
    >
      {theCounter}
    </a>
  );
};

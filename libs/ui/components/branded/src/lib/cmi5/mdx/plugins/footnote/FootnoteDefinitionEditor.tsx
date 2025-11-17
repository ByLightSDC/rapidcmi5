import {
  NestedEditorsContext,
  NestedLexicalEditor,
  useCellValue,
} from '@mdxeditor/editor';

import * as Mdast from 'mdast';
import { fnRefOrder$, fnRefs$ } from './vars';
import { useMemo } from 'react';
import { FootnoteDefEditorProps } from './types';

/**
 * MDX Editor for Footnote Definitions
 * Allows updating of nested content
 * Definition is wrapped in a div with inline block in order to prevent a <br/> tag from
 * being added after each definition
 * @param param0
 * @returns
 */
export const FootnoteDefinitionEditor: React.FC<FootnoteDefEditorProps> = ({
  config,
  label,
  parentEditor,
  lexicalNode,
  mdastNode,
  focusEmitter,
}) => {
  const fnRefs = useCellValue(fnRefs$);
  const fnRefOrder = useCellValue(fnRefOrder$);

  //REF
  /**
   * Definitions are auto numbered based on where their corresponding reference appears in the content
   * We are currently wrapping footnote definitions in <li>
   * and rendering in an <ol> tag so counter is currently unused, but helpful for testing
   * Definitions are ordered by the FootnoteRegistry (see FootnoteRegistry.tsx)
   */
  const theCounter = useMemo(() => {
    for (const [key, value] of Object.entries(fnRefs)) {
      if (value === label) {
        return fnRefOrder.indexOf(key) + 1;
      }
    }
    return -1;
  }, [fnRefOrder, label, fnRefs]);

  return (
    <>
      {/*REF debugging order <Typography
        variant="caption"
        sx={{ position: 'absolute', padding: '2px' }}
      >
        {label}-{theCounter}
      </Typography> */}

      <div
        style={{
          display: 'inline-block',
        }}
      >
        <NestedEditorsContext.Provider
          value={{
            config: config,
            focusEmitter: focusEmitter,
            mdastNode: mdastNode,
            parentEditor: parentEditor,
            lexicalNode: lexicalNode,
          }}
        >
          <NestedLexicalEditor<Mdast.FootnoteDefinition>
            block={false}
            getContent={(node) => node.children}
            getUpdatedMdastNode={(mdastNode, children) => {
              return { ...mdastNode, children } as any;
            }}
          />
        </NestedEditorsContext.Provider>
      </div>
    </>
  );
};

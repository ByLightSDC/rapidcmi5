import { useMemo } from 'react';
import { LexicalEditor } from 'lexical';
import React, { createContext } from 'react';
import { FootnoteReferenceNode } from './FootnoteReferenceNode';
import { useCellValue } from '@mdxeditor/editor';
import { fnRefOrder$ } from './vars';

/**
 * Properties passed to Footnote Reference Editor via a Context
 * @interface FootnoteRefEditorContextValue
 * @prop {(label: string) => void} setLabel Updates the label
 * @prop {FootnoteReferenceNode} lexicalNode The Lexical node being edited
 * @prop {LexicalEditor} parentEditor The parent Lexical editor
 * @group Footnote
 */
export interface FootnoteRefEditorContextValue {
  refCount: number;
  setLabel: (label: string) => void;
  lexicalNode: FootnoteReferenceNode;
  parentEditor: LexicalEditor;
}

export const FootnoteReferenceEditorContext =
  createContext<FootnoteRefEditorContextValue | null>(null);

function FootnoteReferenceEditorContextProvider({
  parentEditor,
  lexicalNode,
  children,
}: {
  parentEditor: LexicalEditor;
  lexicalNode: FootnoteReferenceNode;
  children: React.ReactNode;
}) {
  const fnRefOrder = useCellValue(fnRefOrder$);

  const contextValue = useMemo(() => {
    return {
      refCount: fnRefOrder.length,
      lexicalNode,
      parentEditor,
      setLabel: (label: string) => {
        parentEditor.update(() => {
          lexicalNode.setLabel(label);
        });
      },
    };
  }, [lexicalNode, parentEditor, fnRefOrder]);

  return (
    <FootnoteReferenceEditorContext.Provider value={contextValue}>
      {children}
    </FootnoteReferenceEditorContext.Provider>
  );
}

export default FootnoteReferenceEditorContextProvider;

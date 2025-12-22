import { useMemo } from 'react';
import { LexicalEditor } from 'lexical';
import React, { createContext } from 'react';
import { FootnoteDefinitionNode } from './FootnoteDefinitionNode';
import { FootnoteDefEditorContextValue } from './types';

export const FootnoteDefinitionEditorContext =
  createContext<FootnoteDefEditorContextValue | null>(null);

function FootnoteDefinitionEditorContextProvider({
  parentEditor,
  lexicalNode,
  children,
}: {
  parentEditor: LexicalEditor;
  lexicalNode: FootnoteDefinitionNode;
  children: React.ReactNode;
}) {
  const contextValue = useMemo(() => {
    return {
      lexicalNode,
      parentEditor,
      setLabel: (label: string) => {
        parentEditor.update(() => {
          lexicalNode.setLabel(label);
        });
      },
    };
  }, [lexicalNode, parentEditor]);

  return (
    <FootnoteDefinitionEditorContext.Provider value={contextValue}>
      {children}
    </FootnoteDefinitionEditorContext.Provider>
  );
}

export default FootnoteDefinitionEditorContextProvider;

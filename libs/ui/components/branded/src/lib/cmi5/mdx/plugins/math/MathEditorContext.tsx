import { useMemo } from 'react';

import { LexicalEditor } from 'lexical';
import React, { createContext } from 'react';
import { MathEditorProps, MathNode } from './MathNode';

/**
 * @interface MathEditorContextValue
 * @prop {(code: string) => void} setCode Updates the code contents of the code block
 * @prop {(language: string) => void} setLanguage
 * @prop {(meta: string) => void} setMeta
 * @prop {MathNode} lexicalNode The Lexical node being edited
 * @prop {LexicalEditor} parentEditor The parent Lexical editor
 * @group Math
 */
export interface MathEditorContextValue {
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setMeta: (meta: string) => void;
  lexicalNode: MathNode;
  parentEditor: LexicalEditor;
}

export const MathEditorContext = createContext<MathEditorContextValue | null>(
  null,
);

/**
 * @interface MathEditorDescriptor
 * Pass the object in the mathPlugin parameters
 * @prop {number} priority The priority of the descriptor catch
 * @prop {(language: string | null | undefined, meta: string | null | undefined) => boolean} match Method to determine matching editor to lexical node
 * @prop {React.ComponentType<MathEditorProps>} Editor React component used to edit math nodes
 * @group Math
 */
export interface MathEditorDescriptor {
  priority: number;
  match: (
    language: string | null | undefined,
    meta: string | null | undefined,
  ) => boolean;
  Editor: React.ComponentType<MathEditorProps>;
}

function MathEditorContextProvider({
  parentEditor,
  lexicalNode,
  children,
}: {
  parentEditor: LexicalEditor;
  lexicalNode: MathNode;
  children: React.ReactNode;
}) {
  const contextValue = useMemo(() => {
    return {
      lexicalNode,
      parentEditor,
      setCode: (code: string) => {
        parentEditor.update(() => {
          lexicalNode.setCode(code);
          setTimeout(() => {
            //TODO when we add ability to edit rendered 
            //  Math do something parentEditor.dispatchCommand(NESTED_EDITOR_UPDATED_COMMAND, undefined)
          }, 0);
        });
      },
      setLanguage: (language: string) => {
        parentEditor.update(() => {
          lexicalNode.setLanguage(language);
        });
      },
      setMeta: (meta: string) => {
        parentEditor.update(() => {
          lexicalNode.setMeta(meta);
        });
      },
    };
  }, [lexicalNode, parentEditor]);

  return (
    <MathEditorContext.Provider value={contextValue}>
      {children}
    </MathEditorContext.Provider>
  );
}

export default MathEditorContextProvider;

import {
  $getRoot,
  BLUR_COMMAND,
  FOCUS_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  KEY_BACKSPACE_COMMAND,
  SELECTION_CHANGE_COMMAND,
  createEditor,
  COMMAND_PRIORITY_LOW,
  KEY_DELETE_COMMAND,
} from 'lexical';
import * as Mdast from 'mdast';

import styles from './styles.module.css';
import {
  NESTED_EDITOR_UPDATED_COMMAND,
  codeBlockEditorDescriptors$,
  directiveDescriptors$,
  editorInFocus$,
  exportVisitors$,
  importVisitors$,
  isPartOftheEditorUI,
  jsxComponentDescriptors$,
  jsxIsAvailable$,
  lexicalTheme$,
  nestedEditorChildren$,
  rootEditor$,
  useLexicalNodeRemove,
  useMdastNodeUpdater,
  useNestedEditorContext,
  usedLexicalNodes$,
} from '@mdxeditor/editor';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import classNames from 'classnames';
import { mergeRegister } from '@lexical/utils';
import { useCellValues, usePublisher, useRealm } from '@mdxeditor/gurx';
import { exportLexicalTreeToMdast } from '../../util/exportMarkdownFromLexical';
import { importMdastTreeToLexical } from '../../util/importMarkdownToLexical';
import { RC5SharedHistoryPlugin } from '../history/RC5SharedHistoryPlugin';
import { useEffect, useState } from 'react';

/**
 * A nested editor React component that allows editing of the contents of complex markdown nodes that have nested markdown content (for example, custom directives or JSX elements).
 *
 * @example
 * You can use a type param to specify the type of the mdast node
 *
 * ```tsx
 *
 * interface CalloutDirectiveNode extends LeafDirective {
 *   name: 'callout'
 *   children: Mdast.PhrasingContent[]
 * }
 *
 * return <RC5NestedLexicalEditor<CalloutDirectiveNode> getContent={node => node.children} getUpdatedMdastNode={(node, children) => ({ ...node, children })} />
 * ```
 * @group Custom Editor Primitives
 */
export const RC5NestedLexicalEditor = function <
  T extends Mdast.RootContent,
>(props: {
  /**
   * A function that returns the phrasing content of the mdast node. In most cases, this will be the `children` property of the mdast node, but you can also have multiple nested nodes with their own children.
   */
  getContent: (mdastNode: T) => Mdast.RootContent[];

  /**
   * A function that should return the updated mdast node based on the original mdast node and the new content (serialized as mdast tree) produced by the editor.
   */
  getUpdatedMdastNode: (mdastNode: T, children: Mdast.RootContent[]) => T;

  /**
   * Props passed to the {@link https://github.com/facebook/lexical/blob/main/packages/lexical-react/src/LexicalContentEditable.tsx | ContentEditable} component.
   */
  contentEditableProps?: React.ComponentProps<typeof ContentEditable>;

  /**
   * Whether or not the editor edits blocks (multiple paragraphs)
   */
  block?: boolean;
}) {
  const {
    getContent,
    getUpdatedMdastNode,
    contentEditableProps,
    block = false,
  } = props;
  const { mdastNode, lexicalNode, focusEmitter } = useNestedEditorContext<T>();
  const updateMdastNode = useMdastNodeUpdater<T>();
  const removeNode = useLexicalNodeRemove();
  const content = getContent(mdastNode);
  const realm = useRealm();

  const [
    rootEditor,
    importVisitors,
    exportVisitors,
    usedLexicalNodes,
    jsxComponentDescriptors,
    directiveDescriptors,
    codeBlockEditorDescriptors,
    jsxIsAvailable,
    nestedEditorChildren,
    lexicalTheme,
  ] = useCellValues(
    rootEditor$,
    importVisitors$,
    exportVisitors$,
    usedLexicalNodes$,
    jsxComponentDescriptors$,
    directiveDescriptors$,
    codeBlockEditorDescriptors$,
    jsxIsAvailable$,
    nestedEditorChildren$,
    lexicalTheme$,
  );

  const setEditorInFocus = usePublisher(editorInFocus$);

  const [editor] = useState(() => {
    const editor = createEditor({
      nodes: usedLexicalNodes,
      theme: realm.getValue(lexicalTheme$),
    });
    return editor;
  });

  /**
   * Handles delete & backspace key events occuring in nested lexical editor content
   * Blocks the event from bubbling if the content is empty
   * @param payload
   * @param editor
   * @returns
   */
  const onCheckDelete = (payload: KeyboardEvent, editor: any) => {
    const editorElement = editor.getRootElement();
    // the innerText here is actually the text before backspace takes effect.
    if (editorElement?.innerText === '\n') {
      //REF removeNode();
      // never remove this nested lexical node, even if the text string is empty
      // if we discover use cases where we want to retain this, we can add a flag
      // but the current use case for this component is that it is holding a place for text
      return true; // trap this event
    }
    return false; // dont trap this event
  };

  useEffect(() => {
    focusEmitter.subscribe(() => {
      editor.focus();
    });
  }, [editor, focusEmitter]);

  useEffect(() => {
    editor.update(() => {
      $getRoot().clear();
      let theContent: Mdast.PhrasingContent[] | Mdast.RootContent[] = content;
      if (block) {
        if (theContent.length === 0) {
          theContent = [{ type: 'paragraph', children: [] }];
        }
      } else {
        theContent = [
          { type: 'paragraph', children: content as Mdast.PhrasingContent[] },
        ];
      }

      importMdastTreeToLexical({
        root: $getRoot(),
        mdastRoot: {
          type: 'root',
          children: theContent,
        },
        visitors: importVisitors,
        directiveDescriptors,
        codeBlockEditorDescriptors,
        jsxComponentDescriptors,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, block, importVisitors]);

  useEffect(() => {
    function updateParentNode() {
      editor.getEditorState().read(() => {
        const mdast = exportLexicalTreeToMdast({
          root: $getRoot(),
          visitors: exportVisitors,
          jsxComponentDescriptors,
          jsxIsAvailable,
          addImportStatements: false,
        }) as unknown as Mdast.Root;
        const content: Mdast.RootContent[] = block
          ? mdast.children
          : (mdast.children[0] as Mdast.Paragraph)!.children;
        updateMdastNode(
          getUpdatedMdastNode(
            structuredClone(mdastNode) as any,
            content as any,
          ),
        );
      });
    }

    return mergeRegister(
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          setEditorInFocus({
            editorType: 'lexical',
            rootNode: lexicalNode,
            editorRef: editor,
          });
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        (payload) => {
          const relatedTarget = payload.relatedTarget as HTMLElement | null;
          if (
            isPartOftheEditorUI(relatedTarget, rootEditor!.getRootElement()!)
          ) {
            return false;
          }
          updateParentNode();
          setEditorInFocus(null);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      // triggered by codemirror
      editor.registerCommand(
        NESTED_EDITOR_UPDATED_COMMAND,
        () => {
          updateParentNode();
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          setEditorInFocus({
            editorType: 'lexical',
            rootNode: lexicalNode,
            editorRef: editor,
          });
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onCheckDelete,
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onCheckDelete,
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [
    block,
    editor,
    exportVisitors,
    getUpdatedMdastNode,
    jsxComponentDescriptors,
    jsxIsAvailable,
    lexicalNode,
    mdastNode,
    removeNode,
    setEditorInFocus,
    updateMdastNode,
    rootEditor,
  ]);

  return (
    <LexicalNestedComposer initialEditor={editor} initialTheme={lexicalTheme}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            {...contentEditableProps}
            className={classNames(
              styles['nestedEditor'],
              contentEditableProps?.className,
            )}
          />
        }
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <RC5SharedHistoryPlugin />
      {nestedEditorChildren.map((Child, index) => (
        <Child key={index} />
      ))}
    </LexicalNestedComposer>
  );
};

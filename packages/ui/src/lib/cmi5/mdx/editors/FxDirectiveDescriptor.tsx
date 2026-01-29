import {
  DirectiveDescriptor,
  editorInFocus$,
  insertMarkdown$,
  NestedLexicalEditor,
  $isDirectiveNode,
  useCellValues,
  useLexicalNodeRemove,
  useMdastNodeUpdater,
  usePublisher,
} from '@mdxeditor/editor';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { COMMAND_PRIORITY_LOW } from 'lexical';
import { RoughNotation, types } from 'react-rough-notation';
import { MdxJsxTextElement, MdxJsxFlowElement } from 'mdast-util-mdx';
import { useCallback, useEffect, useState } from 'react';

import { CHANGE_TEXT_FX, selFxNode$, showTextFx$ } from '../plugins/fx/vars';
import { FxDirectiveAttributes, FxDirectiveNode } from '../plugins/fx/types';
import { convertMdastToMarkdown } from '../util/conversion';

/**
 * MDX Fx plugin using the Rough Notation library which allows you to animate circling, underlining, etc text
 * Example markdown
 *  :fx[some **bold** text]{color="blue" type="circle"}
 * Uses the Directives plugin to import/export mdast
 * TextDirective because the rough notation is applied to text
 * NestedLexicalEditor MdxJsxTextElement and block false because we want an inline editor. If we use paragraph, or most other types, the editor will consume the entire line which causes rough notation fx to take up the entire width.
 */
export const FxDirectiveDescriptor: DirectiveDescriptor<FxDirectiveNode> = {
  name: 'fx',
  type: 'textDirective',
  testNode(node) {
    return node.name === 'fx';
  },
  attributes: ['type', 'color'],
  hasChildren: true,
  Editor: ({ mdastNode, lexicalNode, descriptor, parentEditor }) => {
    const [editor] = useLexicalComposerContext();
    const [isFocused, setIsFocused] = useState(false); //editor focused
    const [shouldAnimate, setShouldAnimate] = useState(false); //editor focused
    const publishCurrentSelection = usePublisher(selFxNode$);
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const removeNode = useLexicalNodeRemove();
    const updateMdastNode = useMdastNodeUpdater();
    const insertMarkdown = usePublisher(insertMarkdown$);

    const theType: types = mdastNode.attributes?.type || 'underline';
    const theColor: string = mdastNode.attributes?.color || '#0adf0dff';

    const [editorInFocus, showTextFx] = useCellValues(
      editorInFocus$,
      showTextFx$,
    );

    /**
     * removes text fx from phrasingContent, but keeps phrasingContent
     */
    const handleClearLayout = async () => {
      publishCurrentSelection(null);
      const childMarkdown = convertMdastToMarkdown({
        type: 'paragraph',
        children: mdastNode.children,
      });

      parentEditor.update(() => {
        lexicalNode.selectPrevious();
      });

      await delay(500);
      insertMarkdown(childMarkdown);
      removeNode();
    };

    const handleUpdateType = async (shape: FxDirectiveAttributes) => {
      const childMarkdown = convertMdastToMarkdown({
        type: 'paragraph',
        children: mdastNode.children,
      });

      parentEditor.update(() => {
        lexicalNode.selectPrevious();
      });

      await delay(500);
      //wrap with new attributes
      insertMarkdown(
        `:fx[${childMarkdown}]{color="${shape.color}" type="${shape.type}"}`,
      );
      removeNode();
    };

    const onApplyShape = useCallback(
      (shape: FxDirectiveAttributes) => {
        if (!isFocused) {
          return;
        }

        if (!editorInFocus) {
          return;
        }

        if (editorInFocus?.rootNode?.getKey() !== lexicalNode.getKey()) {
          return;
        }

        if (shape?.type !== 'none') {
          if (shape.type !== mdastNode.attributes.type) {
            ///limitation of rough-notation, you cant update the type, you have to create a new node
            handleUpdateType(shape);
          } else {
            //you can update the other rough-notation properties
            updateMdastNode({
              ...mdastNode,
              attributes: {
                ...mdastNode.attributes,
                type: shape.type,
                color: shape.color,
              },
            });
          }
        } else {
          //remove
          handleClearLayout();
        }
      },
      [isFocused],
    );

    /** Delay is required is we are showing trash and settings icon */
    const unFocus = async () => {
      await delay(500);
      setIsFocused(false);
    };

    /**
     * UE sets a flag if this editor is focused
     * If focused, set a flag that allows UI to display placeholder text so user can find cursor input location
     */
    useEffect(() => {
      if (editorInFocus) {
        const kk = lexicalNode.getKey();
        if (editorInFocus?.rootNode?.getKey() === lexicalNode.getKey()) {
          //update global selection and apply method
          publishCurrentSelection({ ...mdastNode, id: kk });
          setIsFocused(true);
        } else {
          let clearGlobalSelection = true;
          //check directive node
          if ($isDirectiveNode(editorInFocus?.rootNode)) {
            const mdast = editorInFocus?.rootNode.getMdastNode();
            if (mdast.name === 'fx') {
              //if directive is another fx, global selection will get updated
              clearGlobalSelection = false;
            }
          }
          if (clearGlobalSelection) {
            publishCurrentSelection(null);
          }
        }
      } else {
        if (isFocused) {
          //unfocus me
          unFocus();
        }
      }
    }, [editorInFocus, isFocused, lexicalNode, mdastNode]);

    useEffect(() => {
      if (shouldAnimate) {
        setShouldAnimate(false);
      }
    }, [shouldAnimate]);

    /**
     * Listen for TextFx changes
     */
    useEffect(() => {
      const unregister = mergeRegister(
        editor.registerCommand(
          CHANGE_TEXT_FX,
          (payload: { attributes: FxDirectiveAttributes; id: string }) => {
            const kk = lexicalNode.getKey();
            if (payload.id === kk) {
              onApplyShape(payload.attributes);
              return true;
            }
            return false;
          },
          COMMAND_PRIORITY_LOW,
        ),
      );
      return () => {
        unregister();
      };
    }, [editor, onApplyShape]);

    return (
      <RoughNotation
        animate={shouldAnimate}
        brackets={['left', 'right']}
        color={theColor}
        type={theType}
        show={showTextFx}
      >
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <NestedLexicalEditor<MdxJsxTextElement | MdxJsxTextElement>
            getContent={(node) => node.children}
            getUpdatedMdastNode={(mdastNode, children: any) => ({
              ...mdastNode,
              children,
            })}
            block={false} // explicit, but same as default here
          />
        </div>
      </RoughNotation>
    );
  },
};

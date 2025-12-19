import { useCallback, useEffect, useRef } from 'react';
import { FootnoteReferenceNode } from './FootnoteReferenceNode';
import { FootnoteDefinitionNode } from './FootnoteDefinitionNode';
import {
  $createGenericHTMLNode,
  GenericHTMLNode,
  rootEditor$,
  useCellValue,
  useCellValues,
  usePublisher,
} from '@mdxeditor/editor';
import { mergeRegister } from '@lexical/utils';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import {
  $getNodeByKey,
  $getRoot,
  $setSelection,
  COMMAND_PRIORITY_HIGH,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FootnoteDefinitionGroupNode } from './FootnoteDefinitionGroupNode';
import {
  $createFootnoteDefinitionGroupNode,
  $createFootnoteDefinitionNode,
} from './methods';
import { CONTENT_UPDATED_COMMAND, fnRefOrder$, fnRefs$ } from './vars';
import { debugLog } from '../../../../utility/logger';
import { useSelector } from 'react-redux';
import { modal } from '../../../../redux/commonAppReducer';

/**
 * Maintains a registry of reference and definition nodes and their relationship
 * creates a matching definition when a reference is created
 * re-orders definitions
 * @returns
 */
export default function FootnoteRegistry() {
  const [rootEditor] = useCellValues(rootEditor$);

  // look up definitions use to display auto numbering
  const updateFnRefs = usePublisher(fnRefs$);
  const updateFnRefOrder = usePublisher(fnRefOrder$);
  const [editor] = useLexicalComposerContext();
  const modalObj = useSelector(modal);

  //look up reference label by key
  const fnRefs = useRef<{
    [key: string]: string;
  }>({});
  //order of references
  const fnRefOrder = useRef<string[]>([]);
  //look up definition label by key
  const fnDefs = useRef<{
    [key: string]: string;
  }>({});
  const fnDefsByRefs = useRef<{
    [key: string]: string;
  }>({});
  // node container for definitions
  const groupKey = useRef<string | null>(null);
  // when modals pop, focus on nested lexical editors causes inf loop
  // we need to clear focus when modals pop
  const shouldClearSelection = useRef<boolean>(false);

  /**
   * Calculate Auto Numbering
   * Stores keys in an ordered list
   * @param node
   */
  const updateAddToReferenceOrders = useCallback(
    (node: FootnoteReferenceNode) => {
      fnRefs.current[node.getKey()] = node.getLabel();
      if (fnRefOrder.current.length === 0) {
        fnRefOrder.current.push(node.getKey());
      } else if (!fnRefOrder.current.includes(node.getKey())) {
        //find my place in the list
        const theFirstRefNode = $getNodeByKey(fnRefOrder.current[0]);
        //console.log('theFirstRefNode', theFirstRefNode);
        if (theFirstRefNode) {
          const bwNodes = node.getNodesBetween(theFirstRefNode);
          const bwRefNodes = bwNodes.filter((n) => n.getType() === 'fnref');
          if (bwRefNodes.length > 1) {
            const refBeforeMeIndex = fnRefOrder.current.indexOf(
              bwRefNodes[bwRefNodes.length - 2].getKey(),
            );
            if (refBeforeMeIndex >= 0) {
              fnRefOrder.current.splice(refBeforeMeIndex + 1, 0, node.getKey());
            } else {
              //defensize, just add
              fnRefOrder.current.splice(0, 0, node.getKey());
            }
          } else {
            //just me, insert me at position 0
            fnRefOrder.current.splice(0, 0, node.getKey());
          }
        }
      }
    },
    [updateFnRefs, updateFnRefOrder],
  );

  /**
   * Add or order matching definition
   */
  const updateAddDefinition = useCallback(
    (ref: FootnoteReferenceNode, defs: FootnoteDefinitionNode[]) => {
      const olNode: GenericHTMLNode = updateGetContainerNode();

      // See if there is already a matching definition node
      // retrieving this way handles first conversion from raw to visual
      // and definitions may be out of order so we need to find them by label
      let defNode = defs.find(
        (n: FootnoteDefinitionNode) => n.getLabel() === ref.getLabel(),
      );
      if (!defNode) {
        debugLog('new matching def');
        // create new
        defNode = $createFootnoteDefinitionNode({
          label: ref.getLabel(),
          mdastNode: {
            type: 'footnoteDefinition',
            label: ref.getLabel(),
            identifier: ref.getLabel(),
            children: [],
          },
        });
      } else {
        // reparent
        // this happens if definitions are out of order in the source mark down
        debugLog('reparent def');
        defNode.remove();
      }

      // update look ups
      fnDefs.current[defNode.getKey()] = ref.getLabel();
      fnDefsByRefs.current[ref.getKey()] = defNode.getKey();

      //Append or insert into ol node
      const insertIndex = fnRefOrder.current.indexOf(ref.getKey());
      if (insertIndex >= 0 && insertIndex < olNode.getChildren().length) {
        olNode.getLatest().getChildren()[insertIndex].insertBefore(defNode);
      } else {
        olNode.getLatest().append(defNode);
      }
      olNode.markDirty();
    },
    [],
  );

  /**
   * Create or find container for definitions
   */
  const updateGetContainerNode = useCallback(() => {
    //create group
    let defGroupNode = groupKey.current
      ? ($getNodeByKey(groupKey.current) as FootnoteDefinitionGroupNode)
      : null;
    let olNode = null;

    if (defGroupNode) {
      //find ol
      olNode = defGroupNode.getFirstChild() as GenericHTMLNode;
    } else {
      // new ol
      defGroupNode = $createFootnoteDefinitionGroupNode();
      olNode = $createGenericHTMLNode('ol', 'mdxJsxTextElement', []);
      defGroupNode.append(olNode);
      defGroupNode.markDirty();
      $getRoot().append(defGroupNode);
      $getRoot().markDirty();
      groupKey.current = defGroupNode.getKey();
    }
    return olNode;
  }, []);

  /**
   * Remove matching definition by reference key
   */
  const updateRemoveDefinition = useCallback((refKey: string) => {
    debugLog('remove matching definition from ref=', refKey);

    if (!(refKey in fnDefsByRefs.current)) {
      // no ref def pair found
      return;
    }
    const defKey = fnDefsByRefs.current[refKey];
    const defNode = $getNodeByKey(defKey);
    if (defNode) {
      defNode.remove();
      delete fnDefs.current[defNode?.getKey()];
    } else {
      // did not find def to delete
    }
    delete fnDefsByRefs.current[refKey];
  }, []);

  /**
   * Remove reference from ordered list
   */
  const updateRemoveFromReferenceOrders = useCallback((key: string) => {
    delete fnRefs.current[key];

    const index = fnRefOrder.current.indexOf(key);
    if (index !== -1) {
      fnRefOrder.current.splice(index, 1);
    }
  }, []);

  const checkRemoveDefinitionGroup = () => {
    if (fnRefOrder.current.length === 0 && groupKey.current !== null) {
      const group = $getNodeByKey(groupKey.current);
      if (group) {
        debugLog('remove group');
        group.remove();
      }
    }
  };

  const checkModal = useCallback(() => {
    if (shouldClearSelection.current) {
      $setSelection(null);
      shouldClearSelection.current = false;
    }
    return modalObj.type !== '';
  }, [modalObj.type]);

  useEffect(() => {
    shouldClearSelection.current = modalObj.type !== '';
  }, [modalObj.type]);

  /**
   * UE clears look ups when slide content changes
   * and determines reference order when decorators change
   */
  useEffect(() => {
    const unregister = mergeRegister(
      editor.registerCommand(
        CONTENT_UPDATED_COMMAND,
        () => {
          // new slide content, clear refs
          fnRefs.current = {};
          fnDefs.current = {};
          fnDefsByRefs.current = {};
          fnRefOrder.current = [];
          groupKey.current = null;
          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerDecoratorListener(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (decorators: Record<string, any>) => {
          editor.update(() => {
            if (checkModal()) {
              return;
            }

            //REF console.log('------------------decorators changed', decorators);
            //console.log('fnDefs.current', fnDefs.current);
            //console.log('fnRefs.current', fnRefs.current);
            //console.log('fnRefOrder.current', fnRefOrder.current);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const defs: FootnoteDefinitionNode[] = [];
            // build list of definitions
            Object.values(decorators).filter((d: any) => {
              if (
                d.props.lexicalNode &&
                d.props.lexicalNode.getType() === 'fndef'
              ) {
                defs.push(d.props.lexicalNode as FootnoteDefinitionNode);
                return true;
              }
              return undefined;
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Object.values(decorators).filter((d: any) => {
              if (
                d.props.lexicalNode &&
                d.props.lexicalNode.getType() === 'fnref'
              ) {
                const refnode = d.props.lexicalNode as FootnoteReferenceNode;
                if (!refnode.getIsDefInit()) {
                  // debuglog('create matching def');
                  // determine reference ordering
                  updateAddToReferenceOrders(refnode);
                  // add definition node
                  updateAddDefinition(refnode, defs);
                  refnode.setIsDefInit(true);

                  return true;
                }
              }
              return false;
            });

            checkRemoveDefinitionGroup();
          });

          updateFnRefs(fnRefs.current);
          updateFnRefOrder([...fnRefOrder.current]); //spreading ensures use effect picks up change
        },
      ),
    );

    return () => {
      unregister();
    };
  }, [editor]);

  /**
   * UE removes references from look up when destroyed
   */
  useEffect(() => {
    const cleanUpCrudRefListener = rootEditor
      ? rootEditor.registerMutationListener(
          FootnoteReferenceNode,
          (mutations: any) => {
            rootEditor.update(() => {
              //console.log('cleanUpCrudRefListener');
              for (const [key, mutation] of mutations) {
                if (mutation === 'destroyed') {
                  if (key in fnRefs.current) {
                    updateRemoveDefinition(key);
                    updateRemoveFromReferenceOrders(key);
                  } else {
                    //skip clean up, ref not found
                  }
                }
              }
            });
          },
        )
      : null;

    const cleanUpCrudDefListener = rootEditor
      ? rootEditor.registerMutationListener(
          FootnoteDefinitionNode,
          (mutations: any) => {
            rootEditor.read(() => {
              //console.log('cleanUpCrudDefListener');
              for (const [key, mutation] of mutations) {
                //console.log('key ' + key, mutation);
                if (mutation === 'destroyed') {
                  delete fnDefs.current[key];
                }
              }
            });
          },
        )
      : null;

    const cleanUpCrudGroupListener = rootEditor
      ? rootEditor.registerMutationListener(
          FootnoteDefinitionGroupNode,
          (mutations: any) => {
            rootEditor.read(() => {
              //console.log('cleanUpCrudGroupListener');
              for (const [key, mutation] of mutations) {
                if (mutation === 'destroyed') {
                  groupKey.current = null;
                }
              }
            });
          },
        )
      : null;

    return () => {
      fnRefs.current = {};
      fnDefs.current = {};
      fnDefsByRefs.current = {};
      fnRefOrder.current = [];

      if (cleanUpCrudRefListener) {
        cleanUpCrudRefListener();
      }
      if (cleanUpCrudDefListener) {
        cleanUpCrudDefListener();
      }
      if (cleanUpCrudGroupListener) {
        cleanUpCrudGroupListener();
      }
    };
  }, [rootEditor]);
  return <div />;
}

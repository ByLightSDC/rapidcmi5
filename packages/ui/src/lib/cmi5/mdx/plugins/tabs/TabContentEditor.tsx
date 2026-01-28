import { DirectiveEditorProps, NestedLexicalEditor } from '@mdxeditor/editor';
import { useContext, useEffect, useMemo, useState } from 'react';
import { TabsContext } from './TabsContext';
import { ContainerDirective } from 'mdast-util-directive';
import { TabContentDirectiveNode } from './types';

/**
 * Tab Content Editor for tabs plugin
 * @param props
 * @returns
 */
export const TabContentEditor: React.FC<
  DirectiveEditorProps<TabContentDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const { tab } = useContext(TabsContext);

  const [contentIsVisible, setContentIsVisible] = useState(false);
  const [tabIndex, setTabIndex] = useState(-1);

  /**
   * determine tab index for aria labels
   * check current tab selection to see if content should be displayed or hidden
   */
  useMemo(() => {
    parentEditor.update(() => {
      let myTabIndex = -1;
      const parentKeys = lexicalNode.getParent()?.getChildrenKeys();
      if (parentKeys) {
        myTabIndex = parentKeys?.indexOf(lexicalNode.getKey());
        setTabIndex(myTabIndex);
        if (myTabIndex === tab) {
          setContentIsVisible(true);
          return;
        }

        setContentIsVisible(false);
      }
    });
  }, [lexicalNode, parentEditor, tab]);

  useEffect(() => {
    //REF console.log('visible');
  }, [contentIsVisible]);

  /**
   * Renders editable tab content
   */
  return (
    <div
      style={{
        display: contentIsVisible ? undefined : 'none',
      }}
      role="tabpanel"
      id={`tabpanel-${tabIndex}`}
      aria-labelledby={`tab-${tabIndex}`}
    >
      <NestedLexicalEditor<ContainerDirective>
        block={true}
        getContent={(node) => node.children}
        getUpdatedMdastNode={(node, children: any) => ({
          ...node,
          children,
        })}
      />
    </div>
  );
};

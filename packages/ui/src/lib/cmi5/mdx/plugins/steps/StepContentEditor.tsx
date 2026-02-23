import {
  DirectiveEditorProps,
  NestedLexicalEditor,
  readOnly$,
  useCellValues,
  useMdastNodeUpdater,
} from '@mdxeditor/editor';
import { useContext, useEffect, useMemo, useState } from 'react';
import { StepsContext } from './StepsContext';
import { ContainerDirective } from 'mdast-util-directive';
import { StepContentDirectiveNode } from './types';
import { Box, useTheme } from '@mui/material';
import { editorInPlayback$ } from '../../state/vars';
import { AlignmentToolbarControls } from '../../components/AlignmentToolbarControls';
import {
  TextAlign,
  useScopedAlignmentStyles,
} from '../shared/useScopedAlignmentStyles';
import { useFocusWithin } from '../shared/useFocusWithin';

/**
 * Stepper Content Editor for stepper plugin
 * @param props
 * @returns
 */
export const StepContentEditor: React.FC<
  DirectiveEditorProps<StepContentDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const { step } = useContext(StepsContext);
  const muiTheme = useTheme();
  const updateMdastNode = useMdastNodeUpdater();
  const [isPlayback, readOnly] = useCellValues(editorInPlayback$, readOnly$);

  const [contentIsVisible, setContentIsVisible] = useState(false);
  const [tabIndex, setTabIndex] = useState(-1);
  const { isFocused, ref: contentRef } = useFocusWithin<HTMLDivElement>();

  const rawTextAlign = mdastNode.attributes?.textAlign;
  const textAlign: TextAlign =
    rawTextAlign === 'center' || rawTextAlign === 'right'
      ? rawTextAlign
      : 'left';
  const { scopedClass, alignmentStyles } = useScopedAlignmentStyles(
    textAlign,
    'step-content',
  );

  /**
   * determine stepper index for aria labels
   * check current stepper selection to see if content should be displayed or hidden
   */
  useMemo(() => {
    parentEditor.update(() => {
      let myTabIndex = -1;
      const parentKeys = lexicalNode.getParent()?.getChildrenKeys();
      if (parentKeys) {
        myTabIndex = parentKeys?.indexOf(lexicalNode.getKey());
        setTabIndex(myTabIndex);
        if (myTabIndex === step) {
          setContentIsVisible(true);
          return;
        }

        setContentIsVisible(false);
      }
    });
  }, [lexicalNode, parentEditor, step]);

  useEffect(() => {
    //REF 
  }, [contentIsVisible]);

  const handleAlignmentChange = (value: 'left' | 'center' | 'right') => {
    updateMdastNode({
      ...mdastNode,
      attributes: {
        ...mdastNode.attributes,
        textAlign: value === 'left' ? undefined : value,
      },
    });
  };

  /**
   * Renders editable tab content
   */
  return (
    <div
      ref={contentRef}
      style={{
        display: contentIsVisible ? undefined : 'none',
        position: 'relative',
        border: isFocused ? '1px dashed' : '1px dashed transparent',
        borderColor: isFocused ? muiTheme.palette.divider : 'transparent',
        borderRadius: 4,
        padding: 4,
      }}
      role="tabpanel"
      id={`tabpanel-${tabIndex}`}
      aria-labelledby={`tab-${tabIndex}`}
    >
      {alignmentStyles}

      {isFocused && !isPlayback && (
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 10,
            display: 'flex',
            backgroundColor:
              muiTheme.palette.mode === 'dark' ? '#282b30e6' : '#EEEEEEe6',
            borderRadius: 1,
          }}
        >
          <AlignmentToolbarControls
            currentAlignment={textAlign}
            onAlignmentChange={handleAlignmentChange}
            disabled={readOnly}
          />
        </Box>
      )}

      <NestedLexicalEditor<ContainerDirective>
        block={true}
        getContent={(node) => node.children}
        getUpdatedMdastNode={(node, children: any) => ({
          ...node,
          children,
        })}
        contentEditableProps={{
          className: scopedClass,
        }}
      />
    </div>
  );
};

import {
  DirectiveEditorProps,
  readOnly$,
  useCellValues,
  useMdastNodeUpdater,
} from '@mdxeditor/editor';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TabsContext } from './TabsContext';
import { ContainerDirective } from 'mdast-util-directive';
import { TabContentDirectiveNode } from './types';
import { Box, useTheme } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { editorInPlayback$ } from '../../state/vars';
import { AlignmentToolbarControls } from '../../components/AlignmentToolbarControls';
import {
  TextAlign,
  useScopedAlignmentStyles,
} from '../shared/useScopedAlignmentStyles';
import { useFocusWithin } from '../shared/useFocusWithin';
import { TAB_CONTENT_MIN_HEIGHT } from '../../constants/directiveLayout';
import { RC5NestedLexicalEditor } from '../shared/RC5NestedLexicalEditor';

/**
 * Tab Content Editor for tabs plugin
 * @param props
 * @returns
 */
export const TabContentEditor: React.FC<
  DirectiveEditorProps<TabContentDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const { tab } = useContext(TabsContext);
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
    'tab-content',
  );

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
   * Announces this panel's title via a live region rendered inside the
   * panel itself (WCAG 4.1.3 Status Messages) — living here, rather than
   * off in a shared spot outside the tabpanel, means it reads immediately
   * before the panel's own content instead of as a separate stop.
   *
   * Deferred rather than fired synchronously with the visibility change:
   * NVDA's own "selected" state-change announcement fires at the same
   * moment, and cancels an already-queued polite live-region message to
   * speak that instead. Delaying gives our announcement its own turn.
   */
  const [announcement, setAnnouncement] = useState('');
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      // Skip on initial mount — nothing has "changed" yet.
      hasMountedRef.current = true;
      return;
    }

    if (!contentIsVisible) {
      return;
    }

    const title = mdastNode.attributes?.title;
    const timeoutId = setTimeout(() => {
      setAnnouncement(title ? `Now showing ${title} panel` : '');
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [contentIsVisible, mdastNode.attributes?.title]);

  /**
   * Clears the announcement a few seconds after it's set so it behaves as a
   * one-shot status message rather than permanent page text — otherwise a
   * user who later browses back over this spot (without re-activating the
   * tab) would hear "Now showing X panel" read again as if it were part of
   * the actual content.
   */
  useEffect(() => {
    if (!announcement) {
      return;
    }
    const clearTimeoutId = setTimeout(() => setAnnouncement(''), 3000);
    return () => clearTimeout(clearTimeoutId);
  }, [announcement]);

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
      tabIndex={contentIsVisible ? 0 : -1}
    >
      {alignmentStyles}

      <Box aria-live="polite" aria-atomic="true" sx={visuallyHidden}>
        {announcement}
      </Box>

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

      <RC5NestedLexicalEditor<ContainerDirective>
        block={true}
        getContent={(node) => node.children}
        getUpdatedMdastNode={(node, children: any) => {
          return { ...node, children };
        }}
        contentEditableProps={{
          className: scopedClass,
          style: { minHeight: TAB_CONTENT_MIN_HEIGHT },
          'aria-label': mdastNode.attributes?.title
            ? `${mdastNode.attributes.title} tab content`
            : `Tab ${tabIndex + 1} content`,
        }}
      />
    </div>
  );
};

import {
  DirectiveEditorProps,
  NestedLexicalEditor,
  useCellValues,
  useMdastNodeUpdater,
} from '@mdxeditor/editor';

import { ContainerDirective } from 'mdast-util-directive';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { editorInPlayback$ } from '../../state/vars';
import { parseStyleString } from '../../../markdown/MarkDownParser';

import { Box, IconButton, Stack, SxProps, Tooltip, useTheme } from '@mui/material';

import DeleteIconButton from '../../components/DeleteIconButton';
import EditIcon from '@mui/icons-material/Edit';
import InsertLineReturnButton from '../../components/InsertLineReturnButton';

import { StatementDirectiveNode, StatementPreset, StatementsContainerDirectiveNode } from './types';
import { STATEMENT_PRESETS } from './constants';
import { renderMdastBlock } from '../../util/renderMdastStatic';
import * as Mdast from 'mdast';

import { useCoursePresentation } from '../../contexts/PresentationContext';
import { resolveLessonThemeCSS } from '../../../../styles/lessonThemeStyles';
import { useGutterRight } from '../shared/useGutterRight';
import { usePlaybackDecoratorFix } from '../shared/usePlaybackDecoratorFix';
import { ColorSelectionPopover } from '../../../../colors/ColorSelectionPopover';
import { SHAPE_PRESET_COLORS } from '../../constants/colors';
import { findMatchingStatementPreset } from './methods';

import { StatementsContextProvider } from './StatementsContext';
import StatementsSettings from './StatementsSettings';
import { BackgroundColorTrigger, useBackgroundColors } from '@rapid-cmi5/ui';

// Static statement item for playback — NestedLexicalEditor's contenteditable announces as 'clickable' to NVDA.
function StaticStatementItem({
  mdastNode,
  preset,
  blockPadding,
}: {
  mdastNode: StatementDirectiveNode;
  preset: string;
  blockPadding: string;
}) {
  const staticContent = (
    <div>
      {(mdastNode.children as unknown as Mdast.RootContent[]).map((node, i) =>
        renderMdastBlock(node, i),
      )}
    </div>
  );

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '60px',
        marginLeft: blockPadding,
        marginRight: blockPadding,
      }}
      role="statement"
    >
      {preset === '1' && (
        <Stack
          direction="column"
          spacing={2}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 2,
            paddingBottom: 0,
            marginLeft: '25%',
            marginRight: '25%',
          }}
        >
          <Box
            sx={{
              height: '2px',
              backgroundColor: 'background.default',
              width: '100%',
            }}
          />
          <Box />
          <strong>{staticContent}</strong>
          <Box />
          <Box
            sx={{
              height: '2px',
              backgroundColor: 'background.default',
              width: '100%',
            }}
          />
        </Stack>
      )}
      {preset === '2' && (
        <Stack
          direction="column"
          spacing={2}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 2,
            paddingBottom: 0,
            paddingTop: 0,
          }}
        >
          <Box
            sx={{
              height: '4px',
              backgroundColor: 'primary.main',
              width: '10%',
            }}
          />
          <Box />
          {staticContent}
        </Stack>
      )}
      {preset === '3' && (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 2,
            paddingBottom: 0,
            paddingTop: 0,
          }}
        >
          <Stack direction="column">{staticContent}</Stack>
        </Stack>
      )}
      {preset === '4' && (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 2,
            paddingBottom: 0,
            paddingTop: 0,
          }}
        >
          <Stack direction="column">
            <Box
              sx={{
                margin: '8px',
                marginBottom: '16px',
                height: '6px',
                backgroundColor: 'primary.main',
                width: '10%',
              }}
            />
            <strong>{staticContent}</strong>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}

/**
 * Statements Container Editor for the statements layout directive.
 * Renders a statements container with settings modal for layout preset selection.
 * Supports backgroundColor band (box-shadow/clip-path) and gutter context buttons.
 */
export const StatementsContainerEditor: React.FC<
  DirectiveEditorProps<StatementsContainerDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const updateMdastNode = useMdastNodeUpdater();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isPlayback] = useCellValues(editorInPlayback$);

  //#region lesson style
  const muiTheme = useTheme();
  const { rc5Theme } = useCoursePresentation();
  const resolvedThemeCSS = resolveLessonThemeCSS(rc5Theme);
  const blockPadding = resolvedThemeCSS
    ? (resolvedThemeCSS.blockPadding ?? '0px')
    : '32px';
  const { containerRef, menuRight } = useGutterRight(resolvedThemeCSS);
  // Fix NVDA announcing the Lexical decorator portal as clickable.
  usePlaybackDecoratorFix(containerRef);
  const {
    backgroundColor,
    colorPickerAnchor,
    openPicker,
    pendingColor,
    pendingColorRef,
    setBackgroundColor,
    setColorPickerAnchor,
    setOverrideColor,
    setPendingColorAndRef,
  } = useBackgroundColors(mdastNode?.attributes?.['backgroundColor'] ?? '');
  const skipNextCloseRebuildRef = useRef(false);
  const [sxProps, setSxProps] = useState<SxProps>({});
  //#endregion

  /**
   * Determine the current preset
   */
  const currentPreset = useMemo(() => {
    return mdastNode?.attributes?.preset
      ? findMatchingStatementPreset(mdastNode?.attributes?.preset) ||
          STATEMENT_PRESETS[0]
      : STATEMENT_PRESETS[0];
  }, [mdastNode?.attributes?.preset]);

  const [selectedPreset, setSelectedPreset] =
    useState<StatementPreset>(currentPreset);

  /** Carousel index */
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  /** Avatar */
  const currentAvatar = useMemo(() => {
    if (
      mdastNode.children.length > 0 &&
      mdastNode.children[0].name === 'statement'
    ) {
      return mdastNode.children[0].attributes.avatar;
    }
    return undefined;
  }, [mdastNode.children[0].attributes.avatar]);

  /**
   * Reverts changes and closes modal
   */
  const handleCancel = () => {
    setIsConfiguring(false);
  };

  /**
   * Saves preset to this container node.
   * Sets avatar in the statements context so the child content can update itself.
   */
  const handleApply = useCallback(
    async (newPreset: StatementPreset) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsConfiguring(false);

      updateMdastNode({
        ...mdastNode,
        attributes: {
          ...mdastNode.attributes,
          preset: newPreset.id,
        },
        children: mdastNode.children.map((child, i) =>
          i === carouselIndex
            ? { ...child, attributes: { ...child.attributes } }
            : child,
        ) as any,
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
      setSelectedPreset(newPreset);
    },
    [mdastNode, updateMdastNode, carouselIndex],
  );

  /**
   * Clears the background color
   */
  const handleClearColor = useCallback(() => {
    setColorPickerAnchor(null);
    pendingColorRef.current = '';
    skipNextCloseRebuildRef.current = true;
    setOverrideColor('');
    parentEditor.update(
      () => {
        const attrs = { ...mdastNode.attributes };
        delete attrs.backgroundColor;
        lexicalNode.setMdastNode({ ...mdastNode, attributes: attrs });
      },
      { discrete: true },
    );
  }, [lexicalNode, mdastNode, parentEditor]);

  /**
   * Opens the settings modal
   */
  const handleConfigure = useCallback(() => {
    setIsConfiguring(true);
  }, [isConfiguring]);

  /**
   * Sync styles and backgroundColor when mdastNode changes
   */
  useEffect(() => {
    if (mdastNode.attributes?.['style']) {
      try {
        const theSx = parseStyleString(mdastNode.attributes['style']);
        setSxProps(theSx);
      } catch (e) {
        // no styles applied
      }
    }

    const bgColor = mdastNode?.attributes?.backgroundColor ?? '';
    setOverrideColor(bgColor);
  }, [mdastNode]);

  const outerSx: SxProps = backgroundColor
    ? {
        boxShadow: `0 0 0 100vmax ${backgroundColor}`,
        clipPath: `inset(0 -100vmax 0)`,
        backgroundColor,
        paddingTop: blockPadding,
        paddingBottom: blockPadding,
      }
    : {};

  return (
    <>
      <Box
        ref={containerRef}
        {...(backgroundColor ? { 'data-bgcolor': 'true' } : {})}
        sx={{
          position: 'relative',
          padding: 0,
          ...outerSx,
          ...sxProps,
          margin: 0,
        }}
        role="statements"
        aria-label="Statements layout container"
      >
        {/* Inner content box */}
        <Box
          sx={{
            width: '100%',
            boxShadow: selectedPreset.id === '3' ? 2 : undefined,
            backgroundColor: (theme) =>
              `${selectedPreset.id === '3' ? theme.palette.background.paper : 'transparent'}`,
            paddingTop: blockPadding,
            paddingBottom: blockPadding,
          }}
        >
          {/* In playback, render static HTML — NestedLexicalEditor's contenteditable announces as 'clickable' to NVDA. */}
          {isPlayback ? (
            mdastNode.children.map((child, i) => (
              <StaticStatementItem
                key={i}
                mdastNode={child}
                preset={selectedPreset.id}
                blockPadding={blockPadding}
              />
            ))
          ) : (
            <StatementsContextProvider
              carouselIndex={carouselIndex}
              preset={selectedPreset.id}
            >
              <NestedLexicalEditor<ContainerDirective>
                block={true}
                getContent={(node) => node.children}
                getUpdatedMdastNode={(node, children: any) => ({
                  ...node,
                  children,
                })}
                contentEditableProps={{
                  'aria-label': 'Statement layout sections',
                }}
              />
            </StatementsContextProvider>
          )}
        </Box>

        {/* Gutter buttons */}
        {!isPlayback && (
          <Box
            sx={{
              backgroundColor:
                muiTheme.palette.mode === 'dark' ? '#282b30e6' : '#EEEEEEe6',
              position: 'absolute',
              display: 'flex',
              top: backgroundColor ? blockPadding : 0,
              right: menuRight,
            }}
          >
            <Tooltip title="Edit Statement Layout">
              <IconButton onClick={handleConfigure}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <BackgroundColorTrigger
              currentColor={
                backgroundColor ? { color: pendingColor } : undefined
              }
              onTrigger={openPicker}
            />
            <InsertLineReturnButton
              parentEditor={parentEditor}
              lexicalNode={lexicalNode}
            />
            <DeleteIconButton
              onDelete={() => {
                parentEditor.update(() => {
                  if (lexicalNode.getPreviousSibling()) {
                    lexicalNode.selectPrevious();
                  } else {
                    lexicalNode.selectNext();
                  }
                  lexicalNode.remove();
                });
              }}
            />
          </Box>
        )}
      </Box>

      {/* Background Color Popover */}
      <ColorSelectionPopover
        anchorEl={colorPickerAnchor}
        onClose={() => {
          setColorPickerAnchor(null);
          if (skipNextCloseRebuildRef.current) {
            skipNextCloseRebuildRef.current = false;
            return;
          }
          const latest = pendingColorRef.current;
          if (latest !== backgroundColor) {
            setBackgroundColor(latest);
            parentEditor.update(
              () => {
                const attrs = { ...mdastNode.attributes };
                if (latest) {
                  attrs.backgroundColor = latest;
                } else {
                  delete attrs.backgroundColor;
                }
                lexicalNode.setMdastNode({ ...mdastNode, attributes: attrs });
              },
              { discrete: true },
            );
          }
        }}
        lastColor={pendingColor}
        palette={SHAPE_PRESET_COLORS}
        onPickColor={(color) => {
          pendingColorRef.current = color;
          setPendingColorAndRef(color);
        }}
        onClear={handleClearColor}
        noneLabel="No background"
      />

      {isConfiguring && (
        <StatementsSettings
          currentPreset={currentPreset}
          handleCancel={handleCancel}
          handleSubmit={handleApply}
        />
      )}
    </>
  );
};

import {
  DirectiveEditorProps,
  useCellValues,
  useMdastNodeUpdater,
} from '@mdxeditor/editor';
import { RC5NestedLexicalEditor } from '../shared/RC5NestedLexicalEditor';

import { ContainerDirective } from 'mdast-util-directive';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { editorInPlayback$ } from '../../state/vars';
import { parseStyleString } from '../../../markdown/MarkDownParser';

import {
  alpha,
  Box,
  IconButton,
  Stack,
  SxProps,
  Tooltip,
  useTheme,
} from '@mui/material';

import DeleteIconButton from '../../components/DeleteIconButton';
import EditIcon from '@mui/icons-material/Edit';
import InsertLineReturnButton from '../../components/InsertLineReturnButton';

import {
  QuoteContentDirectiveNode,
  QuotePreset,
  QuotesContainerDirectiveNode,
} from './types';
import { QUOTE_PRESETS } from './constants';

import { useCoursePresentation } from '../../contexts/PresentationContext';
import { resolveLessonThemeCSS } from '../../../../styles/lessonThemeStyles';
import { useGutterRight } from '../shared/useGutterRight';
import { ColorSelectionPopover } from '../../../../colors/ColorSelectionPopover';
import { SHAPE_PRESET_COLORS } from '../../constants/colors';
import { findMatchingQuotePreset, getQuotePresetLayout } from './methods';

import { QuotesContext, QuotesContextProvider } from './QuotesContext';
import { renderMdastBlock } from '../../util/renderMdastStatic';
import * as Mdast from 'mdast';
import { useFocusWithin } from '../shared/useFocusWithin';
import QuotesSettings from './QuotesSettings';
import { BackgroundColorTrigger, useBackgroundColors } from '@rapid-cmi5/ui';

// Static quote item for playback — RC5NestedLexicalEditor's contenteditable announces as 'clickable' to NVDA.
function StaticQuoteItem({
  mdastNode,
  preset,
  blockPadding,
}: {
  mdastNode: QuoteContentDirectiveNode;
  preset: string;
  blockPadding: string;
}) {
  const { imageSource } = useContext(QuotesContext);
  const { direction, imgSize, imgRadius, paddingTop } =
    getQuotePresetLayout(preset);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '60px',
        marginLeft: blockPadding,
        marginRight: blockPadding,
      }}
    >
      <Stack
        direction={direction}
        spacing={2}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 2,
          paddingBottom: 0,
          paddingTop,
        }}
      >
        {imageSource && (
          <img
            src={imageSource}
            alt="Author Headshot"
            style={{
              width: imgSize,
              height: imgSize,
              borderRadius: imgRadius,
              objectFit: 'cover',
            }}
          />
        )}
        <div>
          {(mdastNode.children as unknown as Mdast.RootContent[]).map(
            (node, i) => renderMdastBlock(node, i),
          )}
        </div>
        {mdastNode.attributes?.author && <p>{mdastNode.attributes.author}</p>}
      </Stack>
    </Box>
  );
}

// Outer decorator shell — identical in the playback and live-editing render
// paths (same background-color band, role, and gutter-positioning ref), so
// it's shared here rather than duplicated in both.
function QuotesShell({
  containerRef,
  backgroundColor,
  outerSx,
  sxProps,
  children,
}: {
  containerRef: React.Ref<HTMLDivElement>;
  backgroundColor: string;
  outerSx: SxProps;
  sxProps: SxProps;
  children: React.ReactNode;
}) {
  return (
    <Box
      ref={containerRef}
      {...(backgroundColor ? { 'data-bgcolor': 'true' } : {})}
      sx={{
        position: 'relative',
        padding: 0,
        // outerSx/sxProps are always plain style objects in this file (never
        // MUI's array-of-sx form); cast away SxProps' array variant so the
        // spread below doesn't confuse the Box sx overload resolution.
        ...(outerSx as Record<string, unknown>),
        ...(sxProps as Record<string, unknown>),
        margin: 0,
      }}
      role="quotes"
      aria-label="Quotes Container"
    >
      {children}
    </Box>
  );
}

// Faint background-vs-default overlay behind the quote content, identical in
// both render paths.
function QuotesOverlay({ children }: { children: React.ReactNode }) {
  const muiTheme = useTheme();
  return (
    <Box
      sx={{
        backgroundColor: (theme) =>
          `${alpha(theme.palette.background.default, muiTheme.palette.mode === 'light' ? 0 : 0.5)}`,
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Quotes Container Editor for grid layout directive.
 * Renders a quotes container with settings modal for layout preset selection.
 * Supports backgroundColor band (box-shadow/clip-path) and gutter context buttons.
 */
export const QuotesContainerEditor: React.FC<
  DirectiveEditorProps<QuotesContainerDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const { isFocused, ref: contentRef } = useFocusWithin<HTMLDivElement>();
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
  // Outer box: full-width background color band when backgroundColor is set.
  const outerSx: SxProps = backgroundColor
    ? {
        boxShadow: `0 0 0 100vmax ${backgroundColor}`,
        clipPath: `inset(0 -100vmax 0)`,
        backgroundColor,
        paddingTop: blockPadding,
        paddingBottom: blockPadding,
      }
    : {};
  //#endregion

  /**
   * Current preset
   */
  const currentPreset = useMemo(() => {
    return mdastNode?.attributes?.preset
      ? findMatchingQuotePreset(mdastNode?.attributes?.preset) ||
          QUOTE_PRESETS[0]
      : QUOTE_PRESETS[0];
  }, [mdastNode?.attributes?.preset]);

  /** Current Avatar */
  const currentAvatar = useMemo(() => {
    if (
      mdastNode.children.length > 0 &&
      mdastNode.children[0].name === 'quoteContent'
    ) {
      return mdastNode.children[0].attributes.avatar;
    }
    return undefined;
  }, [mdastNode.children[0].attributes.avatar]);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  /** Carousel index
   * FUTURE handle multiple quotes in the container
   */
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  /**
   * Reverts changes and closes modal
   */
  const handleCancel = () => {
    setIsConfiguring(false);
  };

  /**
   * Saves preset to this container node
   * Sets avatar in the quotes context so the child content can update itself
   * this is a work around for how nested lexical editors batch & resolves changes
   */
  const handleApply = useCallback(
    async (newPreset: QuotePreset, newAvatar: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsConfiguring(false);

      // Update preset AND write avatar into child node atomically
      // Problems arise when you attempt to edit parent and then sequentially update child
      // Particularly when using nested lexical editors
      updateMdastNode({
        ...mdastNode,
        attributes: {
          ...mdastNode.attributes,
          preset: newPreset.id,
        },
        children: mdastNode.children.map((child, i) =>
          i === carouselIndex
            ? {
                ...child,
                attributes: { ...child.attributes, avatar: newAvatar },
              }
            : child,
        ) as any,
      });
      setSelectedAvatar(newAvatar);
    },
    [mdastNode, updateMdastNode],
  );

  /**
   * Clears the background color
   */
  const handleClearColor = useCallback(() => {
    setColorPickerAnchor(null);
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

  // Render statically without editor controls or gutter buttons.
  if (isPlayback) {
    return (
      <QuotesShell
        containerRef={containerRef}
        backgroundColor={backgroundColor}
        outerSx={outerSx}
        sxProps={sxProps}
      >
        <Box
          sx={{
            width: '100%',
            borderRadius: 1,
            boxShadow: 2,
            backgroundColor: (theme) => theme.palette.background.paper,
            paddingTop: blockPadding,
            paddingBottom: blockPadding,
          }}
        >
          <QuotesOverlay>
            {mdastNode.children.map((child, i) => (
              <QuotesContextProvider
                key={i}
                preset={currentPreset.id}
                avatar={child.attributes?.avatar}
                carouselIndex={i}
              >
                <StaticQuoteItem
                  mdastNode={child}
                  preset={currentPreset.id}
                  blockPadding={blockPadding}
                />
              </QuotesContextProvider>
            ))}
          </QuotesOverlay>
        </Box>
      </QuotesShell>
    );
  }

  return (
    <>
      <QuotesShell
        containerRef={containerRef}
        backgroundColor={backgroundColor}
        outerSx={outerSx}
        sxProps={sxProps}
      >
        {/* Inner content box */}
        <Box
          sx={{
            width: '100%',
            border: isFocused ? '1px dashed' : '1px',
            borderColor: (theme) => theme.palette.background.paper,
            borderStyle: 'solid',
            borderRadius: 1,
            boxShadow: 2,
            backgroundColor: (theme) => `${theme.palette.background.paper}`,
            paddingTop: blockPadding,
            paddingBottom: blockPadding,
          }}
        >
          <QuotesOverlay>
            <QuotesContextProvider
              carouselIndex={carouselIndex}
              preset={currentPreset.id}
              avatar={selectedAvatar}
            >
              <RC5NestedLexicalEditor<ContainerDirective>
                block={true}
                getContent={(node) => node.children}
                getUpdatedMdastNode={(node, children: any) => ({
                  ...node,
                  children,
                })}
                contentEditableProps={{ 'aria-label': 'Quote layout sections' }}
              />
            </QuotesContextProvider>
          </QuotesOverlay>
        </Box>

        {/* Gutter buttons — absolutely positioned outside decorator at S/M, inside at L/None */}
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
            <Tooltip title="Edit Quotes Layout">
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
      </QuotesShell>

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
          setPendingColorAndRef(color);
        }}
        onClear={handleClearColor}
        noneLabel="No background"
      />

      {isConfiguring && (
        <QuotesSettings
          currentAvatar={selectedAvatar || currentAvatar}
          currentPreset={currentPreset}
          handleCancel={handleCancel}
          handleSubmit={handleApply}
        />
      )}
    </>
  );
};

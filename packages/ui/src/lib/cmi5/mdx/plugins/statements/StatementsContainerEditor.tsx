import {
  DirectiveEditorProps,
  NestedLexicalEditor,
  useCellValues,
  useMdastNodeUpdater,
} from '@mdxeditor/editor';

import { ContainerDirective } from 'mdast-util-directive';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { editorInPlayback$ } from '../../state/vars';
import { parseStyleString } from '../../../markdown/MarkDownParser';

import { Box, IconButton, SxProps, Tooltip, useTheme } from '@mui/material';

import DeleteIconButton from '../../components/DeleteIconButton';
import EditIcon from '@mui/icons-material/Edit';
import PaletteIcon from '@mui/icons-material/Palette';
import InsertLineReturnButton from '../../components/InsertLineReturnButton';

import { StatementPreset, StatementsContainerDirectiveNode } from './types';
import { STATEMENT_PRESETS } from './constants';

import { LessonThemeContext } from '../../contexts/LessonThemeContext';
import { resolveLessonThemeCSS } from '../../../../styles/lessonThemeStyles';
import { useGutterRight } from '../shared/useGutterRight';
import { ColorSelectionPopover } from '../../../../colors/ColorSelectionPopover';
import { SHAPE_PRESET_COLORS } from '../../constants/colors';
import { findMatchingStatementPreset } from './methods';

import { StatementsContextProvider } from './StatementsContext';
import { useFocusWithin } from '../shared/useFocusWithin';
import StatementsSettings from './StatementsSettings';

/**
 * Statements Container Editor for the statements layout directive.
 * Renders a statements container with settings modal for layout preset selection.
 * Supports backgroundColor band (box-shadow/clip-path) and gutter context buttons.
 */
export const StatementsContainerEditor: React.FC<
  DirectiveEditorProps<StatementsContainerDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const { isFocused, ref: contentRef } = useFocusWithin<HTMLDivElement>();
  const updateMdastNode = useMdastNodeUpdater();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isPlayback] = useCellValues(editorInPlayback$);

  //#region lesson style
  const muiTheme = useTheme();
  const { lessonTheme } = useContext(LessonThemeContext);
  const resolvedThemeCSS = resolveLessonThemeCSS(lessonTheme);
  const blockPadding = resolvedThemeCSS
    ? (resolvedThemeCSS.blockPadding ?? '0px')
    : '32px';
  const { gutterRef, gutterRight } = useGutterRight(resolvedThemeCSS);
  const [backgroundColor, setBackgroundColor] = useState<string>(
    mdastNode?.attributes?.backgroundColor ?? '',
  );
  const [colorPickerAnchor, setColorPickerAnchor] =
    useState<HTMLButtonElement | null>(null);
  const [pendingColor, setPendingColor] = useState<string>(
    mdastNode?.attributes?.backgroundColor ?? '',
  );
  const pendingColorRef = useRef(pendingColor);
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
      mdastNode.children[0].name === 'statementContent'
    ) {
      return mdastNode.children[0].attributes.avatar;
    }
    return undefined;
  }, [mdastNode.children[0].attributes.avatar]);

  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

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
    setPendingColor('');
    setBackgroundColor('');
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
    setBackgroundColor(bgColor);
    pendingColorRef.current = bgColor;
    setPendingColor(bgColor);
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
            // border: isFocused ? '1px dashed' : '1px',
            // borderColor: 'divider',
            // borderRadius: 1,
            boxShadow: selectedPreset.id === "3" ? 2 : undefined,
            backgroundColor: (theme) => `${selectedPreset.id === "3" ? theme.palette.background.paper : "transparent"}`,
            paddingTop: blockPadding,
            paddingBottom: blockPadding,
          }}
        >
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
        </Box>

        {/* Gutter buttons */}
        {!isPlayback && (
          <Box
            ref={gutterRef as any}
            sx={{
              backgroundColor:
                muiTheme.palette.mode === 'dark' ? '#282b30e6' : '#EEEEEEe6',
              position: 'absolute',
              display: 'flex',
              top: backgroundColor ? blockPadding : 0,
              right: gutterRight,
            }}
          >
            <Tooltip title="Background Color">
              <IconButton
                onClick={(e) => {
                  pendingColorRef.current = backgroundColor;
                  setPendingColor(backgroundColor);
                  setColorPickerAnchor(e.currentTarget);
                }}
                size="small"
              >
                <PaletteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Statement Layout">
              <IconButton onClick={handleConfigure}>
                <EditIcon />
              </IconButton>
            </Tooltip>
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
          setPendingColor(color);
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

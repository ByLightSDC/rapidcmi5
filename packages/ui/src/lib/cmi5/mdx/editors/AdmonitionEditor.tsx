import {
  activeEditor$,
  currentSelection$,
  DirectiveDescriptor,
  DirectiveEditorProps,
  editorInFocus$,
  NestedLexicalEditor,
  syntaxExtensions$,
  useCellValues,
  useLexicalNodeRemove,
  useMdastNodeUpdater,
} from '@mdxeditor/editor';
import { LexicalEditor } from 'lexical';
import { ContainerDirective, Directives } from 'mdast-util-directive';
import type { Paragraph } from 'mdast';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  SxProps,
  Tooltip,
  useTheme,
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';

import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toMarkdown } from 'mdast-util-to-markdown';

import {
  getAdmonitionColor,
  getAdmonitionHexColor,
  getAdmonitionIcon,
  getSeverityHexBorderColor,
  getSeverityHexColor,
} from '../../markdown/components/AdmonitionStyles';

import { AdmonitionDirectiveNode } from './AdmonitionDirectiveDescriptor';
import DeleteIconButton from '../components/DeleteIconButton';
import SettingsIconButton from '../components/SettingsIconButton';
import InsertLineReturnButton from '../components/InsertLineReturnButton';
import { AdmonitionTypeEnum } from '@rapid-cmi5/cmi5-build-common';
import { SelectorMainUi } from '../../../inputs/selectors/selectors';
import { debugLogError } from '../../../utility/logger';
import { editorInPlayback$ } from '../state/vars';
import { convertMarkdownToMdast } from '../util/conversion';
import { LessonThemeContext } from '../contexts/LessonThemeContext';
import { resolveLessonThemeCSS } from '../../../styles/lessonThemeStyles';
import { useGutterRight } from '../plugins/shared/useGutterRight';
import { ColorSelectionPopover } from '../../../colors/ColorSelectionPopover';
import { SHAPE_PRESET_COLORS } from '../constants/colors';

export declare interface AdmonitionDirectiveEditorProps<
  T extends Directives = Directives,
> {
  /**
   * The mdast directive node.
   */
  mdastNode: T;
  /**
   * The parent lexical editor - use this if you are dealing with the Lexical APIs.
   */
  parentEditor: LexicalEditor;
  /**
   * The Lexical directive node.
   */
  lexicalNode: AdmonitionDirectiveNode;
  /**
   * The descriptor that activated the editor
   */
  descriptor: DirectiveDescriptor;
}

/**
 * AdmonitionEditor
 * @param param0
 * @returns
 */
export const AdmonitionEditor: React.FC<DirectiveEditorProps> = ({
  lexicalNode,
  mdastNode,
  parentEditor,
  descriptor,
}) => {
  const muiTheme = useTheme();
  const { lessonTheme } = useContext(LessonThemeContext);
  const resolvedThemeCSS = resolveLessonThemeCSS(lessonTheme);
  const blockPadding = resolvedThemeCSS ? (resolvedThemeCSS.blockPadding ?? '0px') : '32px';

  //REF const markdownSourceEditorValue = useCellValue(markdownSourceEditorValue$);
  const [defaultCollapseSel, setDefaultCollapseSel] = useState<
    string | undefined
  >(undefined);
  const removeNode = useLexicalNodeRemove();
  const updateMdastNode = useMdastNodeUpdater();
  const [isCollapsible, setIsCollapsible] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isFocused, setIsFocused] = useState(false); //editor focused
  const [isPlaceholderAllowed, setIsPlaceholderAllowed] = useState(false); //editor focused

  const [isOpen, setIsOpen] = useState(true);
  const [title, setTitle] = useState('');
  const [adHexColor, setAdHexColor] = useState<string>('');
  const [adSeverityHexColor, setAdSeverityHexColor] = useState<string>('');
  const [adSeverityHexBorderColor, setAdSeverityHexBorderColor] =
    useState<string>('');
  const [adType, setAdType] = useState<AdmonitionTypeEnum>(
    AdmonitionTypeEnum.note,
  );
  const [backgroundColor, setBackgroundColor] = useState<string>(
    mdastNode?.attributes?.['backgroundColor'] ?? '',
  );
  const [colorPickerAnchor, setColorPickerAnchor] =
    useState<HTMLButtonElement | null>(null);
  const [pendingColor, setPendingColor] = useState<string>(
    mdastNode?.attributes?.['backgroundColor'] ?? '',
  );
  const pendingColorRef = useRef(pendingColor);
  const skipNextCloseRebuildRef = useRef(false);
  const { gutterRef, gutterRight } = useGutterRight(resolvedThemeCSS);

  const [syntaxExtensions] = useCellValues(syntaxExtensions$);
  const [adColor, setAdColor] = useState<
    | 'info'
    | 'disabled'
    | 'action'
    | 'inherit'
    | 'success'
    | 'warning'
    | 'error'
    | 'primary'
    | 'secondary'
  >('info');

  //REF const themeSel = useSelector(themeColor);

  let attCollapse: string | undefined | null = undefined;
  if (mdastNode?.attributes) {
    if (
      Object.prototype.hasOwnProperty.call(mdastNode?.attributes, 'collapse')
    ) {
      attCollapse = mdastNode?.attributes['collapse'];
    }
  }

  const [currentSelection, activeEditor, editorInFocus, isPlayback] =
    useCellValues(
      currentSelection$,
      activeEditor$,
      editorInFocus$,
      editorInPlayback$,
    );

  /**
   * Stores expanded state in local state
   */
  const onAccordionChange = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  /**
   * delete mdast node
   */
  const onDelete = useCallback(
    (event?: any) => {
      event?.stopImmediatePropagation();
      removeNode();
    },
    [removeNode],
  );

  const onConfigure = useCallback(() => {
    onFocusHandler();
    setIsConfiguring(!isConfiguring);
  }, [isConfiguring]);

  const getTitle = (attributes?: any) => {
    if (
      attributes &&
      Object.prototype.hasOwnProperty.call(attributes, 'title')
    ) {
      const val = attributes['title'];
      return val || '';
    }
    return 'Title Goes Here';
  };

  /**
   * update mdast node attributes when local state changes
   */
  const onSelectCollapsible = useCallback(
    (collapsible: string) => {
      const theAttributes = { ...mdastNode.attributes };
      switch (collapsible) {
        case 'Collapse Start Open':
          theAttributes['collapse'] = 'open';
          break;
        case 'Collapse Start Closed':
          theAttributes['collapse'] = 'closed';
          break;
        case 'No Collapse':
          delete theAttributes['collapse'];
          break;
        default:
          return;
      }
      setDefaultCollapseSel(collapsible);
      updateMdastNode({
        ...mdastNode,
        attributes: theAttributes,
      });
    },
    [mdastNode, updateMdastNode],
  );

  /**
   *
   */
  const onFocusHandler = React.useCallback(() => {
    lexicalNode.select();
  }, [lexicalNode]);

  /**
   * Rebuilds the admonition node with a new background color.
   */
  /**
   * Sets local state from mdast attributes
   */
  useEffect(() => {
    if (attCollapse) {
      const isOpen = attCollapse;
      setIsCollapsible(true);
      setIsOpen(isOpen === 'open' ? true : false);
      setDefaultCollapseSel(
        isOpen === 'open' ? 'Collapse Start Open' : 'Collapse Start Closed',
      );
    } else {
      setIsOpen(true);
      setIsCollapsible(false);
      setDefaultCollapseSel('No Collapse');
    }
  }, [attCollapse, setIsOpen]);

  /**
   * UE Sets title
   */
  useEffect(() => {
    if (
      mdastNode?.attributes &&
      Object.prototype.hasOwnProperty.call(mdastNode.attributes, 'title')
    ) {
      const val = mdastNode.attributes['title'];
      if (val) {
        setTitle(val);
      }
    }
  }, [mdastNode?.attributes, title]);

  /**
   * UE Sets color & icon info from name
   */
  useEffect(() => {
    //console.log('UE admon name', mdastNode.name);
    try {
      const adType: AdmonitionTypeEnum =
        AdmonitionTypeEnum[mdastNode.name as keyof typeof AdmonitionTypeEnum];
      setAdType(adType);
      const severityColor = getAdmonitionColor(adType);
      setAdColor(severityColor);
      setAdHexColor(getAdmonitionHexColor(adType));
      setAdSeverityHexColor(getSeverityHexColor(severityColor));
      setAdSeverityHexBorderColor(getSeverityHexBorderColor(severityColor));
    } catch (e: any) {
      debugLogError(e);
    }
  }, [mdastNode?.name]);

  /**
   * UE sets a flag if this editor is focused
   * If focused, set a flag that allows UI to display placeholder text so user can find cursor input location
   */
  useEffect(() => {
    let editorIsFocused = false;
    if (
      editorInFocus &&
      editorInFocus?.rootNode?.getKey() === lexicalNode.getKey()
    ) {
      editorIsFocused = true;
      setIsPlaceholderAllowed(false);
    } else {
      setIsPlaceholderAllowed(true);
    }
    setIsFocused(editorIsFocused);
  }, [editorInFocus, lexicalNode]);

  // Sync backgroundColor from mdastNode
  useEffect(() => {
    const bgColor = mdastNode?.attributes?.['backgroundColor'] ?? '';
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

  const expandIcon = useMemo(() => {
    if (!isCollapsible) {
      return undefined;
    }
    if (adHexColor) {
      return (
        <div style={{ color: '#FFFFFFBF' }}>
          <ExpandCircleDownIcon color={adColor} />
        </div>
      );
    }

    return <ExpandCircleDownIcon color={adColor} />;
  }, [adHexColor, adColor, isCollapsible]);

  return (
    <Box
      {...(backgroundColor ? { 'data-bgcolor': 'true' } : {})}
      sx={{
        margin: 0,
        padding: 0,
        position: 'relative',
        ...outerSx,
      }}
    >
      <Box sx={{ width: '100%' }}>
        {isConfiguring && !isPlayback && (
          <SelectorMainUi
            defaultValue={defaultCollapseSel}
            divProps={{ marginLeft: -24 }}
            key="select-collapse"
            isTransient={false}
            listItemProps={{
              color: 'primary',
              fontSize: 'small',
              fontWeight: 'lighter',
            }}
            options={[
              'Collapse Start Open',
              'Collapse Start Closed',
              'No Collapse',
            ]}
            sxProps={{ minWidth: '100px', height: '30px' }}
            isFormStyle={false}
            onSelect={onSelectCollapsible}
          />
        )}
        <Accordion
          expanded={isCollapsible ? isOpen : true}
          onChange={onAccordionChange}
          variant="outlined"
          sx={{
            borderColor: 'transparent',
            margin: 0,
            '&.MuiPaper-rounded': { borderRadius: '8px' },
          }}
        >
          <AccordionSummary
            expandIcon={expandIcon}
            className="admonition-header"
            sx={{
              fontSize: '18px',
              backgroundColor: adSeverityHexColor || adHexColor || adColor,
              borderRadius: isOpen ? '8px 8px 0 0' : '8px',
              borderColor: adSeverityHexBorderColor,
              borderStyle: 'solid',
              borderWidth: '1px',
              zIndex: 100,
            }}
          >
            {getAdmonitionIcon(adType)}
            <div
              style={{
                // @ts-ignore
                '--basePageBg': 'transparent',
              }}
            >
              <NestedLexicalEditor<Paragraph>
                getContent={(node) => {
                  const theNode = convertMarkdownToMdast(
                    getTitle(mdastNode.attributes),
                    syntaxExtensions,
                  );
                  return theNode.children;
                }}
                getUpdatedMdastNode={(
                  mdastParagraphNode,
                  paragraphChildren: any,
                ) => {
                  if (paragraphChildren.length > 0) {
                    const titleStr = toMarkdown(paragraphChildren[0]);
                    if (titleStr === title) {
                      return mdastParagraphNode;
                    }

                    setTitle(titleStr);

                    return {
                      ...mdastParagraphNode,
                      attributes: {
                        collapse: attCollapse,
                        title: titleStr,
                      },
                    };
                  }

                  return mdastParagraphNode;
                }}
                contentEditableProps={{ 'aria-label': 'Admonition Title' }}
              />
            </div>
          </AccordionSummary>

          <AccordionDetails
            sx={{
              backgroundColor: 'background.paper',
              borderColor: adSeverityHexBorderColor,
              borderRadius: '0 0 8px 8px',
              borderStyle: 'solid',
              borderWidth: '1px',
            }}
          >
            <NestedLexicalEditor<ContainerDirective>
              block={true}
              getContent={(node) => {
                return node.children;
              }}
              getUpdatedMdastNode={(mdastNode, containerChildren: any) => {
                return { ...mdastNode, children: containerChildren };
              }}
              contentEditableProps={{ 'aria-label': 'Admonition Content' }}
            />
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Gutter buttons — absolutely positioned outside decorator at S/M, inside at L/None */}
      {!isPlayback && (
        <Box
          ref={gutterRef as any}
          sx={{
            backgroundColor:
              muiTheme.palette.mode === 'dark' ? '#282b30e6' : '#EEEEEEe6',
            display: 'flex',
            position: 'absolute',
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
          <SettingsIconButton onConfigure={onConfigure} />
          <InsertLineReturnButton
            parentEditor={parentEditor}
            lexicalNode={lexicalNode}
          />
          <DeleteIconButton onDelete={onDelete} />
        </Box>
      )}

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
            parentEditor.update(() => {
              const attrs = { ...(mdastNode.attributes as Record<string, string>) };
              if (latest) {
                attrs['backgroundColor'] = latest;
              } else {
                delete attrs['backgroundColor'];
              }
              lexicalNode.setMdastNode({ ...mdastNode, attributes: attrs });
            }, { discrete: true });
          }
        }}
        lastColor={pendingColor}
        palette={SHAPE_PRESET_COLORS}
        onPickColor={(color) => {
          pendingColorRef.current = color;
          setPendingColor(color);
        }}
        onClear={() => {
          setColorPickerAnchor(null);
          pendingColorRef.current = '';
          skipNextCloseRebuildRef.current = true;
          setPendingColor('');
          setBackgroundColor('');
          parentEditor.update(() => {
            const attrs = { ...(mdastNode.attributes as Record<string, string>) };
            delete attrs['backgroundColor'];
            lexicalNode.setMdastNode({ ...mdastNode, attributes: attrs });
          }, { discrete: true });
        }}
        noneLabel="No background"
      />
    </Box>
  );
};

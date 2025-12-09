/* eslint-disable react/jsx-no-useless-fragment */

import {
  activeEditor$,
  currentSelection$,
  DirectiveDescriptor,
  DirectiveEditorProps,
  editorInFocus$,
  NestedLexicalEditor,
  syntaxExtensions$,
  useCellValue,
  useCellValues,
  useLexicalNodeRemove,
  useMdastNodeUpdater,
  usePublisher,
} from '@mdxeditor/editor';
import { LexicalEditor } from 'lexical';
import {
  ContainerDirective,
  Directives,
  LeafDirective,
  TextDirective,
} from 'mdast-util-directive';
import type { Paragraph, Text } from 'mdast';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  TextField,
  Typography,
  AlertColor,
  AlertTitle,
  Box,
  Alert,
  Stack,
} from '@mui/material';

import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { fromMarkdown, type Options } from 'mdast-util-from-markdown';
import { toMarkdown } from 'mdast-util-to-markdown';

import { AdmonitionTypeEnum } from '@rangeos-nx/types/cmi5';
import { AdmonitionDirectiveNode } from './AdmonitionDirectiveDescriptor';
import DeleteIconButton from '../components/DeleteIconButton';
import SettingsIconButton from '../components/SettingsIconButton';
import RightMenuContainer from '../components/RightMenuContainer';
import { SelectorMainUi } from '../../../inputs/selectors/selectors';
import { debugLogError } from '../../../utility/logger';
import { getAdmonitionColor, getAdmonitionHexColor, getSeverityHexColor, getSeverityHexBorderColor, getAdmonitionIcon } from '../../markdown/components/AdmonitionStyles';
import { editorInPlayback$ } from '../state/vars';

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

  const expandIcon = useMemo(() => {
    if (!isCollapsible) {
      return undefined;
    }
    if (adHexColor) {
      return (
        <div style={{ color: adHexColor }}>
          <ExpandCircleDownIcon color={adColor} />
        </div>
      );
    }

    return <ExpandCircleDownIcon color={adColor} />;
  }, [adHexColor, adColor, isCollapsible]);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {!isPlayback && (
        <RightMenuContainer sxProps={{ marginBottom: isCollapsible ? -2 : 0 }}>
          <>
            {isConfiguring && (
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
          </>
          <SettingsIconButton onConfigure={onConfigure} />
          <DeleteIconButton onDelete={onDelete} />
        </RightMenuContainer>
      )}
      <Accordion
        expanded={isCollapsible ? isOpen : true}
        onChange={onAccordionChange}
        style={{ margin: '1em 0' }}
        variant="outlined"
        sx={{
          borderColor: 'transparent',
        }}
      >
        <AccordionSummary
          expandIcon={expandIcon}
          sx={{
            fontSize: '18px',
            backgroundColor: adSeverityHexColor || adHexColor || adColor,
            borderRadius: isOpen ? '8px 8px 0 0' : '8px',
            borderColor: adSeverityHexBorderColor,
            borderStyle: 'solid',
            borderWidth: isFocused ? '1px' : '1px',
            zIndex: 100,
          }}
        >
          {getAdmonitionIcon(adType)}
          <div
            style={{
              // @ts-ignore
              '--basePageBg': 'transparent',
              //backgroundColor: 'adSeverityHexColor || adHexColor || adColor',
            }}
          >
            <NestedLexicalEditor<Paragraph>
              getContent={(node) => {
                const theNode = fromMarkdown(getTitle(mdastNode.attributes), {
                  extensions: syntaxExtensions,
                  mdastExtensions: null,
                });
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
            />
          </div>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            backgroundColor: 'background.paper',
            borderColor: adSeverityHexBorderColor,
            borderRadius: '0 0 8px 8px ',
            borderStyle: 'solid',
            borderWidth: isFocused ? '1px' : '1px',
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
          />
        </AccordionDetails>
      </Accordion>
    </>
  );
};

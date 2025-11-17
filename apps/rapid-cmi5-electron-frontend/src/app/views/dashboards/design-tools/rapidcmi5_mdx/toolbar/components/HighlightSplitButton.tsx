import { useCallback, useState } from 'react';
import { ButtonWithTooltip, activeEditor$, Cell } from '@mdxeditor/editor';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';
import { $getSelection, $isRangeSelection } from 'lexical';
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from '@lexical/selection';

import BorderColorIcon from '@mui/icons-material/BorderColor';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ColorSelectionPopover } from './ColorSelectionPopover';
import { HIGHLIGHT_PRESET_COLORS } from '../constants';

const DEFAULT_HIGHLIGHT = '#FFFF00';
export const highlightColorLast$ = Cell<string>(DEFAULT_HIGHLIGHT);

/**
 * Displays two buttons:
 * A normal-sized button to highlight text, and a smaller button to open a
 * popover for color selection.
 * @constructor
 */
export function HighlightSplitButton() {
  const editor = useCellValue(activeEditor$);
  const lastColor = useCellValue(highlightColorLast$);
  const publishLastColor = usePublisher(highlightColorLast$);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [showDefaultIcon, setShowDefaultIcon] = useState(false);
  const disabled = !editor;

  // highlight a selection of text by setting the text's background color
  const applyHighlight = useCallback(
    (color: string | null) => {
      if (!editor) return;
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        const prop = 'background-color';
        if (color) {
          const current = $getSelectionStyleValueForProperty(
            selection,
            prop,
            '',
          );
          const same = (current || '').toLowerCase() === color.toLowerCase();
          $patchStyleText(selection, { [prop]: same ? null : color } as any);
        } else {
          $patchStyleText(selection, { [prop]: null } as any);
        }
      });
    },
    [editor],
  );

  const handleMainClick = useCallback(() => {
    applyHighlight(lastColor);
  }, [applyHighlight, lastColor]);

  const openPicker = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const closePicker = useCallback(() => setAnchorEl(null), []);

  const onPickColor = useCallback(
    (c: string) => {
      publishLastColor(c);
      setShowDefaultIcon(false);
      applyHighlight(c);
    },
    [publishLastColor, applyHighlight],
  );

  const onClear = useCallback(() => {
    setShowDefaultIcon(true);
    applyHighlight(null);
  }, [applyHighlight]);

  return (
    <>
      <ButtonWithTooltip
        title={
          showDefaultIcon ? 'Apply highlight' : `Apply highlight (${lastColor})`
        }
        onClick={handleMainClick}
        disabled={disabled}
        aria-label="Apply highlight"
      >
        <BorderColorIcon
          fontSize="small"
          style={showDefaultIcon ? undefined : { color: lastColor }}
        />
      </ButtonWithTooltip>

      <ButtonWithTooltip
        title="Choose highlight color"
        onClick={openPicker}
        disabled={disabled}
        aria-label="Open highlight color menu"
        style={{
          width: '10px',
          minWidth: 0,
          padding: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        <ArrowDropDownIcon fontSize="small" />
      </ButtonWithTooltip>

      <ColorSelectionPopover
        anchorEl={anchorEl}
        onClose={closePicker}
        lastColor={lastColor}
        palette={HIGHLIGHT_PRESET_COLORS}
        onPickColor={onPickColor}
        onClear={onClear}
        noneLabel="No highlight"
      />
    </>
  );
}

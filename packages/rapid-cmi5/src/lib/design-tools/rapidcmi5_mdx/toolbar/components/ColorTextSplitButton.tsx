import { useCallback, useState } from 'react';
import {
  ButtonWithTooltip,
  activeEditor$,
  Cell,
  useCellValue,
  usePublisher,
} from '@mdxeditor/editor';
import { $getSelection, $isRangeSelection } from 'lexical';
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from '@lexical/selection';

import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { TEXT_PRESET_COLORS } from '@rapid-cmi5/ui';
import { ColorSelectionPopover } from 'packages/ui/src/lib/colors/ColorSelectionPopover';


const DEFAULT_COLOR = '#FFFFFF';
export const textColorLast$ = Cell<string>(DEFAULT_COLOR);
export const buttonWithTooltipStyle = {
  width: '10px',
  minWidth: 0,
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
};

/**
 * Displays two buttons:
 * A normal-sized button to set the color of text, and a smaller button to open
 * a popover for color selection.
 * @constructor
 */
export function ColorTextSplitButton() {
  const editor = useCellValue(activeEditor$);
  const lastColor = useCellValue(textColorLast$);
  const publishLastColor = usePublisher(textColorLast$);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [showDefaultIcon, setShowDefaultIcon] = useState(false);
  const disabled = !editor;

  // set the color of a selection of text
  const applyColor = useCallback(
    (color: string | null) => {
      if (!editor) return;
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        if (color) {
          const current = $getSelectionStyleValueForProperty(
            selection,
            'color',
            '',
          );
          const same = (current || '').toLowerCase() === color.toLowerCase();
          $patchStyleText(selection, { color: same ? (null as any) : color });
        } else {
          $patchStyleText(selection, { color: null } as any);
        }
      });
    },
    [editor],
  );

  const handleMainClick = useCallback(() => {
    applyColor(lastColor);
  }, [applyColor, lastColor]);

  const openPicker = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const closePicker = useCallback(() => setAnchorEl(null), []);

  const onPickColor = useCallback(
    (c: string) => {
      publishLastColor(c);
      setShowDefaultIcon(false);
      applyColor(c);
    },
    [publishLastColor, applyColor],
  );

  const onClear = useCallback(() => {
    setShowDefaultIcon(true);
    applyColor(null);
  }, [applyColor]);

  return (
    <>
      <ButtonWithTooltip
        title="Change text color"
        onClick={handleMainClick}
        disabled={disabled}
      >
        <FormatColorTextIcon
          fontSize="small"
          style={showDefaultIcon ? undefined : { color: lastColor }}
        />
      </ButtonWithTooltip>

      <ButtonWithTooltip
        title="Select text color"
        onClick={openPicker}
        disabled={disabled}
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
        palette={TEXT_PRESET_COLORS}
        onPickColor={onPickColor}
        onClear={onClear}
        noneLabel="No color"
      />
    </>
  );
}

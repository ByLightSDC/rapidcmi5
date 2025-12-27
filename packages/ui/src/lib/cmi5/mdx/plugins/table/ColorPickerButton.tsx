import { ButtonWithTooltip } from '@mdxeditor/editor';
import { useCallback, useState } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { HIGHLIGHT_PRESET_COLORS } from '../../constants/colors';
import { ColorSelectionPopover } from '../../../../colors/ColorSelectionPopover';
import { IconButton } from '@mui/material';

export default function ColorPickerButton({
  onColorPicked,
  defaultColor = '#FFFFFF',
  disabled,
}: {
  onColorPicked?: (color: string | null) => void;
  defaultColor?: string;
  disabled?: boolean;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  // const [currentColor, setColor] = useState<string | null>(defaultColor);

  const openPicker = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const closePicker = useCallback(() => setAnchorEl(null), []);

  const onPickColor = useCallback(
    (c: string) => {
      if (onColorPicked) {
        onColorPicked(c);
      }
    },
    [onColorPicked],
  );

  const onClear = useCallback(() => {
    if (onColorPicked) {
      onColorPicked(null);
    }
  }, [onColorPicked]);

  return (
    <>
      {/* <ButtonWithTooltip
        title="Select text background color"
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
      </ButtonWithTooltip> */}
      <IconButton
        //sx={{ position: 'absolute', right: 0 }}
        tabIndex={-1}
        aria-label="split"
        size={'small'}
        color="primary"
        onClick={openPicker}
      >
        <ArrowDropDownIcon fontSize="small" />
      </IconButton>
      <ColorSelectionPopover
        anchorEl={anchorEl}
        onClose={closePicker}
        lastColor={defaultColor || ''}
        palette={HIGHLIGHT_PRESET_COLORS}
        onPickColor={onPickColor}
        onClear={onClear}
        noneLabel="No highlight"
      />
    </>
  );
}

import { ButtonWithTooltip } from '@mdxeditor/editor';
import { useCallback, useState } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { HIGHLIGHT_PRESET_COLORS } from '../../constants/colors';
import { ColorSelectionPopover } from '../../../../colors/ColorSelectionPopover';
import { IconButton, Tooltip } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';

export default function ColorPickerButton({
  onColorPicked,
  defaultColor = '#FFFFFF',
  disabled,
  openCallback,
}: {
  onColorPicked?: (color: string | null) => void;
  defaultColor?: string;
  disabled?: boolean;
  openCallback: (isOpen: boolean) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const openPicker = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    openCallback(true);
  }, []);

  const closePicker = useCallback(() => {
    setAnchorEl(null);
    openCallback(false);
  }, []);

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
      <Tooltip title="Background Color">
        <IconButton
          tabIndex={-1}
          aria-label="split"
          size={'small'}
          color="primary"
          onClick={openPicker}
        >
          <PaletteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <ColorSelectionPopover
        anchorEl={anchorEl}
        onClose={closePicker}
        lastColor={defaultColor || ''}
        palette={HIGHLIGHT_PRESET_COLORS}
        onPickColor={onPickColor}
        onClear={onClear}
        noneLabel="No background color"
      />
    </>
  );
}

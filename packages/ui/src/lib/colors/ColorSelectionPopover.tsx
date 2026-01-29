import { useEffect, useMemo, useState } from 'react';
import { Popover, Box, IconButton, Tooltip, Divider } from '@mui/material';
import { MuiColorInput } from 'mui-color-input';

/**
 * A color square on which to click
 * @param color
 * @param size
 * @constructor
 */
function Swatch({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: 3,
        border: '1px solid rgba(0,0,0,0.2)',
        background: color,
        boxSizing: 'border-box',
      }}
    />
  );
}

/**
 * A square to click on for no color, i.e. NONE
 * @param size
 * @constructor
 */
function NoneSwatch({ size = 18 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'relative',
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: 3,
        border: '1px solid rgba(0,0,0,0.2)',
        background: '#ffffff',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, transparent 45%, rgba(220,0,0,0.9) 45%, rgba(220,0,0,0.9) 55%, transparent 55%)',
        }}
      />
    </span>
  );
}

/**
 * Returns true if the string is a valid hex number else false.
 * @param v
 */
const isValidHex = (v: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v || '');

export type ColorSelectionPopoverProps = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  lastColor: string;
  palette: readonly string[];
  onPickColor: (color: string) => void;
  onClear: () => void;
  noneLabel?: string;
  widthPx?: number;
};

/**
 * Displays a popover for choosing a color from a swatch.
 * A color picker is provided, as well, if the user wishes to choose a color not
 * included in the swatch.
 * @param anchorEl
 * @param onClose
 * @param lastColor
 * @param palette
 * @param onPickColor
 * @param onClear
 * @param noneLabel
 * @param widthPx
 * @constructor
 */
export function ColorSelectionPopover({
  anchorEl,
  onClose,
  lastColor,
  palette,
  onPickColor,
  onClear,
  noneLabel = 'None',
  widthPx = 260,
}: ColorSelectionPopoverProps) {
  const open = Boolean(anchorEl);

  // just in case the array of colors that was passed in has duplicates,
  // deduplicate to avoid duplicate key warnings at runtime
  const COLORS = useMemo(
    () => Array.from(new Set(palette.map((c) => c.toLowerCase()))),
    [palette],
  );

  const [pickerColor, setPickerColor] = useState(lastColor);

  useEffect(() => {
    if (open) setPickerColor(lastColor);
  }, [open, lastColor]);

  // create a grid of the color palette
  const grid = (colors: string[], offset = 0) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(9, 20px)',
        gap: 1,
      }}
    >
      {colors.map((c, i) => (
        <Tooltip
          placement="top"
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 2],
                  },
                },
              ],
            },
          }}
          arrow
          key={`${c}-${offset + i}`}
          title={c}
        >
          <IconButton
            size="small"
            onClick={() => {
              onPickColor(c);
              onClose(); // close only on swatch click (not on picker typing)
            }}
            sx={{
              p: 0,
              borderRadius: 1,
              border:
                c === lastColor.toLowerCase()
                  ? '2px solid #1976d2'
                  : '1px solid rgba(0,0,0,0.2)',
            }}
            aria-label={`Pick ${c}`}
          >
            <Swatch color={c} />
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Box sx={{ p: 1.25, maxWidth: widthPx }}>
        {/* Row 1: None + first colors */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(9, 20px)',
            gap: 1,
            mb: 1,
          }}
        >
          <Tooltip arrow title={noneLabel}>
            <IconButton
              size="small"
              onClick={() => {
                onClear();
                onClose();
              }}
              sx={{
                p: 0,
                borderRadius: 1,
                border: '1px solid rgba(0,0,0,0.2)',
              }}
              aria-label={`${noneLabel} (clear)`}
            >
              <NoneSwatch />
            </IconButton>
          </Tooltip>

          {grid(COLORS.slice(0, 8)).props.children}
        </Box>

        {/* Remaining swatches */}
        {grid(COLORS.slice(8), 8)}

        <Divider sx={{ my: 1 }} />

        {/* Color Picker (does NOT close popover) */}
        <MuiColorInput
          format="hex"
          value={pickerColor}
          onChange={(value) => {
            setPickerColor(value);
            if (!isValidHex(value)) return;
            onPickColor(value);
          }}
          isAlphaHidden
          sx={{ width: '100%' }}
        />
      </Box>
    </Popover>
  );
}

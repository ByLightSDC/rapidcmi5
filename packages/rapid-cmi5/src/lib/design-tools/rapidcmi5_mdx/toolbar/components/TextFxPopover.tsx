import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';

import {
  Popover,
  Box,
  IconButton,
  Tooltip,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Paper,
} from '@mui/material';
import { MuiColorInput } from 'mui-color-input';


import { RoughNotation, types } from 'react-rough-notation';

import DoneIcon from '@mui/icons-material/Done';
import RefreshIcon from '@mui/icons-material/Refresh';

import {
  activeEditor$,
  editorInFocus$,
  useCellValue,
  usePublisher,
} from '@mdxeditor/editor';
import { FxDirectiveAttributes, SHAPE_PRESET_COLORS, refreshTextFx$, selFxNode$, applyFx$, defaultFxColor, debugLog, CHANGE_TEXT_FX, ButtonMinorUi, ButtonModalCancelUi, ButtonLoadingUi } from '@rapid-cmi5/ui';

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
 * Returns true if the string is a valid hex number else false.
 * @param v
 */
const isValidHex = (v: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v || '');
const toggleButtonStyle = {
  borderStyle: 'none',
  marginBottom: 2,
  padding: 0,
  minHeight: '40px',
};

export type TextFxPopoverProps = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onApplyNew: (shape: FxDirectiveAttributes) => void;
};

/**
 * Displays a popover for choosing a shape type and colors.
 * @constructor
 */
export function TextFxPopover({
  anchorEl,
  onClose,
  onApplyNew,
}: TextFxPopoverProps) {
  const open = Boolean(anchorEl);
  const anchorRef = useRef(null);

  const COLORS = useMemo(
    () => Array.from(new Set(SHAPE_PRESET_COLORS.map((c) => c.toLowerCase()))),
    [],
  );

  const editorInFocus = useCellValue(editorInFocus$);
  const editor = useCellValue(activeEditor$); //required for commands
  const refreshTextFx = useCellValue(refreshTextFx$);
  const selFxNode = useCellValue(selFxNode$);
  const applyFx = useCellValue(applyFx$);

  const [shapeType, setShapeType] = useState<types | 'none'>('none');
  const [borderColor, setBorderColor] = useState(defaultFxColor);
  const [borderPickerColor, setBorderPickerColor] = useState(defaultFxColor);

  const handleApply = useCallback(() => {
    if (selFxNode) {
      debugLog('apply update to selected fx' + borderColor, shapeType);

      if (editor) {
        if (editor) {
          editor.dispatchCommand(CHANGE_TEXT_FX, {
            attributes: {
              ...selFxNode.attributes,
              type: shapeType,
              color: borderColor,
            },
            id: selFxNode?.id,
          });
        }
      }
    } else {
      debugLog('insert fx, apply to selected content');
      // New Fx
      onApplyNew({
        type: shapeType,
        color: borderColor,
      });
    }
    onClose();
  }, [applyFx, selFxNode, borderColor, shapeType]);

  const onShapeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: types | null,
  ) => {
    if (newType !== null) {
      setShapeType(newType);
    }
  };

  // create a grid of the color palette for border
  const borderColorGrid = (
    <Box
      ref={anchorRef}
      sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 20px)', gap: 1 }}
    >
      {COLORS.map((c, i) => (
        <Tooltip
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
          placement="top"
          key={`border-${c}-${i}`}
          title={c}
        >
          <IconButton
            size="small"
            onClick={() => {
              setBorderColor(c);
              setBorderPickerColor(c);
            }}
            sx={{
              p: 0,
              borderRadius: 1,
              border:
                c === borderColor.toLowerCase()
                  ? '2px solid #1976d2'
                  : '1px solid rgba(0,0,0,0.2)',
            }}
            aria-label={`Pick border ${c}`}
          >
            <Swatch color={c} />
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );

  useEffect(() => {
    if (open) {
      if (selFxNode) {
        debugLog('opened with selFxNode=', selFxNode);
        setShapeType(selFxNode.attributes.type);
        setBorderColor(selFxNode.attributes.color || defaultFxColor);
        setBorderPickerColor(selFxNode.attributes.color || defaultFxColor);
      }
    }
  }, [open, selFxNode]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            borderRadius: 2,
            maxWidth: 540,
          }}
        >
          {/* Shape Type Selection */}
          <Typography variant="h4" sx={{ mb: 1, display: 'block' }}>
            Text Fx
          </Typography>
          {/* <ButtonMainUi onClick={onToggleShowFx}>
            Toggle Show{isTextShowing}
          </ButtonMainUi> */}

          <ToggleButtonGroup
            value={shapeType}
            exclusive
            onChange={onShapeChange}
            aria-label="shape type"
            size="small"
            sx={{
              //mb: 2,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
            }}
          >
            <ToggleButton value="underline" sx={toggleButtonStyle}>
              <RoughNotation
                animate={false}
                color={borderColor}
                type="underline"
                show={true}
              >
                Underline
              </RoughNotation>
            </ToggleButton>

            <ToggleButton value="box" sx={toggleButtonStyle}>
              <RoughNotation
                animate={false}
                color={borderColor}
                type="box"
                show={true}
              >
                Box
              </RoughNotation>
            </ToggleButton>
            <ToggleButton value="circle" sx={toggleButtonStyle}>
              <RoughNotation
                animate={false}
                color={borderColor}
                type="circle"
                show={true}
              >
                Circle
              </RoughNotation>
            </ToggleButton>
            <ToggleButton value="highlight" sx={toggleButtonStyle}>
              <RoughNotation
                animate={false}
                color={borderColor}
                type="highlight"
                show={true}
              >
                Highlight
              </RoughNotation>
            </ToggleButton>
            <ToggleButton value="strike-through" sx={toggleButtonStyle}>
              <RoughNotation
                animate={false}
                color={borderColor}
                type="strike-through"
                show={true}
              >
                Strike-Through
              </RoughNotation>
            </ToggleButton>
            <ToggleButton value="crossed-off" sx={toggleButtonStyle}>
              <RoughNotation
                animate={false}
                color={borderColor}
                type="crossed-off"
                show={true}
              >
                Crossed-Off
              </RoughNotation>
            </ToggleButton>
            <ToggleButton value="bracket" sx={toggleButtonStyle}>
              <RoughNotation
                animate={false}
                brackets={['left', 'right']}
                color={borderColor}
                type="bracket"
                show={true}
              >
                Brackets
              </RoughNotation>
            </ToggleButton>
            <ToggleButton value="none" sx={toggleButtonStyle}>
              None
            </ToggleButton>
          </ToggleButtonGroup>
          <Divider sx={{ my: 1.5 }} />
          {/* Rough Notation Color */}
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}
          >
            Color
          </Typography>
          {borderColorGrid}
          <MuiColorInput
            format="hex"
            value={borderPickerColor}
            onChange={(value) => {
              setBorderPickerColor(value);
              if (!isValidHex(value)) return;
              setBorderColor(value);
            }}
            isAlphaHidden
            sx={{ width: '100%', mt: 1 }}
            size="small"
          />
          <Divider sx={{ my: 1.5, visibility: 'hidden' }} />
          <ButtonMinorUi
            startIcon={<RefreshIcon />}
            sxProps={{ borderStyle: 'none' }}
            onClick={() => {
              if (refreshTextFx) {
                refreshTextFx();
              }
            }}
          >
            Refresh
          </ButtonMinorUi>
          {/* Action Buttons */}
          <Box
            sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}
          >
            <div />
            {/* TODO <Tooltip arrow title="Remove shape">
            <IconButton
              size="small"
              onClick={() => {
                onClear();
                onClose();
              }}
              sx={{
                p: 0.5,
                borderRadius: 1,
                border: '1px solid rgba(0,0,0,0.2)',
              }}
              aria-label="Remove shape"
            >
              <NoneSwatch />
            </IconButton>
          </Tooltip> */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <ButtonModalCancelUi onClick={onClose}>
                Cancel
              </ButtonModalCancelUi>
              <ButtonLoadingUi
                loading={false}
                startIcon={<DoneIcon />}
                type="button"
                onClick={handleApply}
              >
                Apply
              </ButtonLoadingUi>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Popover>
  );
}

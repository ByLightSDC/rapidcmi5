import React, { ChangeEvent, useEffect, useState } from 'react';
// @ts-ignore - inline-style-parser has type declaration issues
import parse from 'inline-style-parser';

/* MUI */
import {
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { MuiColorInput } from 'mui-color-input';
import { SelectorMainUi } from 'packages/ui/src/lib/inputs/selectors/selectors';
import ModalDialog from 'packages/ui/src/lib/modals/ModalDialog';



interface TableStyleProps {
  isOpen: boolean;
  style: string;
  setTableStyle: (style: string) => void;
  setIsStyleDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BorderStyles: string[] = [
  'solid',
  'dotted',
  'dashed',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
  'hidden',
  'none',
];

/**
 * If a number string has a unit of 'px' at the end, remove the unit.
 */
const removeUnit = (numberWithUnit: string) => {
  let unitlessNumberString = numberWithUnit;
  const pxIndex = numberWithUnit.indexOf('px');
  if (pxIndex !== -1) {
    unitlessNumberString = numberWithUnit.substring(0, pxIndex);
  }
  return unitlessNumberString;
};

export const TableStyleDialog: React.FC<TableStyleProps> = ({
                                                              isOpen,
                                                              style,
                                                              setTableStyle,
                                                              setIsStyleDialogOpen,
                                                            }) => {
  // --- Border State ---
  const [borderStyle, setBorderStyle] = useState<string>('solid');
  const [borderWidth, setBorderWidth] = useState<number>(0);
  const [borderColor, setBorderColor] = useState<string>('#000000');
  const [borderRadius, setBorderRadius] = useState<number>(0);

  // --- Drop Shadow State ---
  const [shadowX, setShadowX] = useState<number>(0);
  const [shadowY, setShadowY] = useState<number>(0);
  const [shadowBlur, setShadowBlur] = useState<number>(0);
  const [shadowColor, setShadowColor] = useState<string>('#000000');

  // Parse the style string and populate local state
  useEffect(() => {
    // Reset defaults
    setBorderWidth(1);
    setBorderStyle('solid');
    setBorderColor('#000000');
    setBorderRadius(0);
    setShadowX(0);
    setShadowY(0);
    setShadowBlur(0);
    setShadowColor('#000000');

    if (!style) return;

    const styles = parse(style);

    let foundBorder = false;

    styles.forEach((s: any) => {
      if (s.type === 'declaration') {
        // --- Border Parsing ---
        if (s.property === 'border-width') {
          const numberValue = parseFloat(removeUnit(s.value));
          setBorderWidth(numberValue);
          foundBorder = true;
        } else if (s.property === 'border-color') {
          setBorderColor(s.value);
          foundBorder = true;
        } else if (s.property === 'border-style') {
          setBorderStyle(s.value);
          foundBorder = true;
        } else if (s.property === 'border-radius') {
          const numberValue = parseFloat(removeUnit(s.value));
          setBorderRadius(numberValue);
        } else if (s.property === 'border') {
          // Handle shorthand 'border: 1px solid #000'
          const parts = s.value.split(/\s+/);
          parts.forEach((part: string) => {
            if (part.endsWith('px')) setBorderWidth(parseFloat(removeUnit(part)));
            else if (part.startsWith('#') || part.startsWith('rgb')) setBorderColor(part);
            else if (BorderStyles.includes(part)) setBorderStyle(part);
          });
          foundBorder = true;
        }
        // --- Shadow Parsing ---
        else if (s.property === 'box-shadow') {
          // Basic parser for "Xpx Ypx Blurpx Color"
          const parts = s.value.match(/(-?\d+(\.\d+)?)px\s+(-?\d+(\.\d+)?)px\s+(\d+(\.\d+)?)px\s+(.+)/);
          if (parts) {
            setShadowX(parseFloat(parts[1]));
            setShadowY(parseFloat(parts[3]));
            setShadowBlur(parseFloat(parts[5]));
            setShadowColor(parts[7].trim());
          }
        }
      }
    });

    if (!foundBorder) setBorderWidth(1);

  }, [style]);

  const handleStyleSubmit = () => {
    let styleString = '';

    // --- Border CSS ---
    if (borderWidth >= 0) {
      styleString += `border-width: ${borderWidth}px; `;
      styleString += `border-style: ${borderStyle}; `;
      styleString += `border-color: ${borderColor}; `;
    }

    // --- Radius CSS ---
    if (borderRadius !== 0) {
      styleString += `border-radius: ${borderRadius}px; `;
      styleString += `border-collapse: separate; `;
      styleString += `border-spacing: 0; `;
      styleString += `overflow: hidden; `;
    }

    // --- Shadow CSS ---
    if (shadowX !== 0 || shadowY !== 0 || shadowBlur !== 0) {
      styleString += `box-shadow: ${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}; `;
    }

    setTableStyle(styleString);
    setIsStyleDialogOpen(false);
  };

  const handleStyleCancel = () => {
    setIsStyleDialogOpen(false);
  };

  // Handlers
  const handleBorderWidthSliderChange = (e: Event, value: number | number[]) => { if (typeof value === 'number') setBorderWidth(value); };
  const handleBorderRadiusSliderChange = (e: Event, value: number | number[]) => { if (typeof value === 'number') setBorderRadius(value); };

  // Shadow Handlers
  const handleShadowXChange = (e: Event, value: number | number[]) => { if (typeof value === 'number') setShadowX(value); };
  const handleShadowYChange = (e: Event, value: number | number[]) => { if (typeof value === 'number') setShadowY(value); };
  const handleShadowBlurChange = (e: Event, value: number | number[]) => { if (typeof value === 'number') setShadowBlur(value); };

  // Generate dynamic styles for the preview table
  const previewTableStyle: React.CSSProperties = {
    width: '200px',
    backgroundColor: 'white',
    // Apply Border
    borderWidth: `${borderWidth}px`,
    borderStyle: borderStyle,
    borderColor: borderColor,
    // Apply Radius & Clipping
    borderRadius: borderRadius > 0 ? `${borderRadius}px` : undefined,
    borderCollapse: borderRadius > 0 ? 'separate' : 'collapse',
    borderSpacing: 0,
    overflow: borderRadius > 0 ? 'hidden' : undefined,
    // Apply Shadow
    boxShadow: (shadowX !== 0 || shadowY !== 0 || shadowBlur !== 0)
      ? `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}`
      : undefined,
  };

  return (
    <ModalDialog
      title="Edit Table Style"
      maxWidth="lg"
      buttons={['Cancel', 'Apply']}
      dialogProps={{ open: isOpen }}
      handleAction={(index: number) => {
        if (index === 0) handleStyleCancel();
        else handleStyleSubmit();
      }}
    >
      <div style={{ margin: 0, width: '100%', padding: '10px' }}>

        {/* --- PREVIEW SECTION --- */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Style Preview</Typography>
            <Box
              sx={{
                width: '100%',
                bgcolor: '#f5f5f5',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '150px',
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}
            >
              <table style={previewTableStyle}>
                <thead>
                <tr>
                  <th style={{ backgroundColor: '#ffffd7', padding: '8px', borderBottom: '1px solid #ddd', borderRight: '1px solid #ddd' }}>A</th>
                  <th style={{ backgroundColor: '#fffc66', padding: '8px', borderBottom: '1px solid #ddd' }}>B</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td style={{ backgroundColor: '#cbefff', padding: '8px', borderRight: '1px solid #ddd' }}>1</td>
                  <td style={{ backgroundColor: '#56c1ff', padding: '8px' }}>2</td>
                </tr>
                </tbody>
              </table>
            </Box>
          </Stack>
        </Paper>

        <Grid container spacing={2}>

          {/* --- LEFT COLUMN: BORDER --- */}
          <Grid size={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Stack spacing={2}>
                <Typography variant="h6">Border</Typography>

                {/* Border Width */}
                <Grid container alignItems="center" spacing={2} sx={{ width: '100%' }}>
                  <Grid size={2}><Typography variant="caption">Width</Typography></Grid>
                  <Grid size={6}>
                    <Slider size={'small'} value={borderWidth} onChange={handleBorderWidthSliderChange} min={0} max={20} step={1} />
                  </Grid>
                  <Grid size={4}>
                    <TextField margin="dense" type="number" value={borderWidth} fullWidth size="small" slotProps={{ input: { inputProps: { step: 1, min: 0, max: 20 } } }} onChange={(e) => setBorderWidth(Number(e.target.value))} />
                  </Grid>
                </Grid>

                {/* Border Color */}
                <Grid container alignItems="center" spacing={2} sx={{ width: '100%' }}>
                  <Grid size={2}><Typography variant="caption">Color</Typography></Grid>
                  <Grid size={10}>
                    <MuiColorInput format="hex" value={borderColor} onChange={setBorderColor} isAlphaHidden={true} fullWidth />
                  </Grid>
                </Grid>

                {/* Border Style */}
                <Grid container alignItems="center" spacing={2} sx={{ width: '100%' }}>
                  <Grid size={2}><Typography variant="caption">Style</Typography></Grid>
                  <Grid size={10}>
                    <SelectorMainUi defaultValue={borderStyle} options={BorderStyles} onSelect={setBorderStyle} />
                  </Grid>
                </Grid>

                {/* Border Radius */}
                <Grid container alignItems="center" spacing={2} sx={{ width: '100%' }}>
                  <Grid size={2}><Typography variant="caption">Radius</Typography></Grid>
                  <Grid size={6}>
                    <Slider size={'small'} value={borderRadius} onChange={handleBorderRadiusSliderChange} min={0} max={50} step={1} />
                  </Grid>
                  <Grid size={4}>
                    <TextField margin="dense" type="number" value={borderRadius} fullWidth size="small" slotProps={{ input: { inputProps: { step: 1, min: 0, max: 50 } } }} onChange={(e) => setBorderRadius(Number(e.target.value))} />
                  </Grid>
                </Grid>
              </Stack>
            </Paper>
          </Grid>

          {/* --- RIGHT COLUMN: DROP SHADOW --- */}
          <Grid size={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Stack spacing={2}>
                <Typography variant="h6">Drop Shadow</Typography>

                {/* Shadow X */}
                <Grid container alignItems="center" spacing={2} sx={{ width: '100%' }}>
                  <Grid size={2}><Typography variant="caption">Offset X</Typography></Grid>
                  <Grid size={6}>
                    <Slider size={'small'} value={shadowX} onChange={handleShadowXChange} min={-50} max={50} step={1} />
                  </Grid>
                  <Grid size={4}>
                    <TextField margin="dense" type="number" value={shadowX} fullWidth size="small" onChange={(e) => setShadowX(Number(e.target.value))} />
                  </Grid>
                </Grid>

                {/* Shadow Y */}
                <Grid container alignItems="center" spacing={2} sx={{ width: '100%' }}>
                  <Grid size={2}><Typography variant="caption">Offset Y</Typography></Grid>
                  <Grid size={6}>
                    <Slider size={'small'} value={shadowY} onChange={handleShadowYChange} min={-50} max={50} step={1} />
                  </Grid>
                  <Grid size={4}>
                    <TextField margin="dense" type="number" value={shadowY} fullWidth size="small" onChange={(e) => setShadowY(Number(e.target.value))} />
                  </Grid>
                </Grid>

                {/* Shadow Blur */}
                <Grid container alignItems="center" spacing={2} sx={{ width: '100%' }}>
                  <Grid size={2}><Typography variant="caption">Blur</Typography></Grid>
                  <Grid size={6}>
                    <Slider size={'small'} value={shadowBlur} onChange={handleShadowBlurChange} min={0} max={50} step={1} />
                  </Grid>
                  <Grid size={4}>
                    <TextField margin="dense" type="number" value={shadowBlur} fullWidth size="small" onChange={(e) => setShadowBlur(Number(e.target.value))} />
                  </Grid>
                </Grid>

                {/* Shadow Color */}
                <Grid container alignItems="center" spacing={2} sx={{ width: '100%' }}>
                  <Grid size={2}><Typography variant="caption">Color</Typography></Grid>
                  <Grid size={10}>
                    <MuiColorInput format="hex" value={shadowColor} onChange={setShadowColor} isAlphaHidden={true} fullWidth />
                  </Grid>
                </Grid>
              </Stack>
            </Paper>
          </Grid>

        </Grid>
      </div>
    </ModalDialog>
  );
};

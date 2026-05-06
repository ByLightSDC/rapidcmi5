import React, { ChangeEvent, CSSProperties, useEffect, useState } from 'react';
// @ts-ignore - inline-style-parser has type declaration issues
import parse from 'inline-style-parser';
import ImagePreviewPNG from './icons/image-preview.png';

/* MUI */
import {
  Box,
  Checkbox,
  Paper,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { MuiColorInput } from 'mui-color-input';

// icons
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import BlockIcon from '@mui/icons-material/Block';
import { BlockWidthValue, BLOCK_WIDTH_INHERIT, ModalDialog, SelectorMainUi } from '@rapid-cmi5/ui';
import { ContentWidthEnum } from '@rapid-cmi5/cmi5-build-common';

const blockWidthDescriptions: Record<BlockWidthValue, string> = {
  [BLOCK_WIDTH_INHERIT]: 'Use lesson-level content width setting',
  [ContentWidthEnum.None]: 'No width constraint (full editor width)',
  [ContentWidthEnum.Small]: 'Narrow content area (55% of available width)',
  [ContentWidthEnum.Medium]: 'Standard content area (75% of available width)',
  [ContentWidthEnum.Large]: 'Full width content area',
};

interface StyleProps {
  isOpen: boolean;
  style: string;
  setImageStyle: React.Dispatch<React.SetStateAction<string>>;
  setIsStyleDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  contentWidth?: ContentWidthEnum;
  onContentWidthSave: (contentWidth: ContentWidthEnum | undefined) => void;
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
 * @param numberWithUnit
 */
const removeUnit = (numberWithUnit: string) => {
  let unitlessNumberString = numberWithUnit;

  const pxIndex = numberWithUnit.indexOf('px');
  if (pxIndex !== -1) {
    unitlessNumberString = numberWithUnit.substring(0, pxIndex);
  }

  return unitlessNumberString;
};

/**
 * A modal dialog for setting inline image styles visually.
 * @param isOpen
 * @param style
 * @param setImageStyle
 * @param setIsStyleDialogOpen
 * @constructor
 */
export const StyleDialog: React.FC<StyleProps> = ({
  isOpen,
  style,
  setImageStyle,
  setIsStyleDialogOpen,
  contentWidth,
  onContentWidthSave,
}) => {
  // misc styles
  const [alignment, setAlignment] = useState<string | null>('');
  const [opacity, setOpacity] = useState(1);
  const [blockWidthValue, setBlockWidthValue] = useState<BlockWidthValue>(
    contentWidth ?? BLOCK_WIDTH_INHERIT,
  );
  const [isFlipVertical, setIsFlipVertical] = useState(false);
  const [isFlipHorizontal, setIsFlipHorizontal] = useState(false);

  // border styles
  const [borderStyle, setBorderStyle] = useState<string>('solid');
  const [borderWidth, setBorderWidth] = useState<number>(0);
  const [borderColor, setBorderColor] = useState<string>('#000000');
  const [borderRadius, setBorderRadius] = useState<number>(0);

  // drop shadow style
  const [dropShadowOffsetX, setDropShadowOffsetX] = useState<number>(0);
  const [dropShadowOffsetY, setDropShadowOffsetY] = useState<number>(0);
  const [dropShadowBlurRadius, setDropShadowBlurRadius] = useState<number>(0);
  const [dropShadowColor, setDropShadowColor] = useState<string>('#000000');

  // sync block width when dialog opens
  useEffect(() => {
    setBlockWidthValue(contentWidth ?? BLOCK_WIDTH_INHERIT);
  }, [contentWidth, isOpen]);

  // parse the style string and set values
  useEffect(() => {
    const styles = parse(style);

    styles.forEach((style: any) => {
      if (style.type === 'declaration') {
        if (style.property === 'opacity') {
          const numberValue = parseFloat(style.value);
          setOpacity(numberValue);
        } else if (style.property === 'border-width') {
          const numberValue = parseFloat(removeUnit(style.value));
          setBorderWidth(numberValue);
        // text-align is now handled via the textAlign attribute (toolbar controls), not the style string
        // } else if (style.property === 'text-align') {
        //   setAlignment(style.value);
        } else if (style.property === 'border-color') {
          setBorderColor(style.value);
        } else if (style.property === 'border-style') {
          setBorderStyle(style.value);
        } else if (style.property === 'border-radius') {
          const numberValue = parseFloat(removeUnit(style.value));
          setBorderRadius(numberValue);
        } else if (style.property === 'filter') {
          // format of drop-shadow filter:
          // drop-shadow(2px 2px 3px #000000)
          const dropShadowFilterString = style.value;
          const stringStartLength = 'drop-shadow('.length;
          const dropShadowValues = dropShadowFilterString
            .slice(stringStartLength, -1)
            .split(' ');

          setDropShadowOffsetX(parseFloat(removeUnit(dropShadowValues[0])));
          setDropShadowOffsetY(parseFloat(removeUnit(dropShadowValues[1])));
          setDropShadowBlurRadius(parseFloat(removeUnit(dropShadowValues[2])));
          setDropShadowColor(dropShadowValues[3]);
        } else if (style.property === 'transform') {
          // format of scale transform:
          // scale(-1, -1)
          const scaleString = style.value;
          const scaleStringLength = 'scale('.length;
          const scaleValues = scaleString
            .slice(scaleStringLength, -1)
            .split(', ');

          setIsFlipVertical(scaleValues[0] === '-1');
          setIsFlipHorizontal(scaleValues[1] === '-1');
        }
      }
    });
  }, [style]);

  const handleFlipHorizontalCheckboxChange = (
    e: ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setIsFlipHorizontal(checked);
  };

  const handleFlipVerticalCheckboxChange = (
    e: ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setIsFlipVertical(checked);
  };

  const handleDropShadowOffsetXSliderChange = (
    e: Event,
    value: number | number[],
  ) => {
    if (typeof value === 'number') {
      setDropShadowOffsetX(value);
    }
  };

  const handleDropShadowOffsetYSliderChange = (
    e: Event,
    value: number | number[],
  ) => {
    if (typeof value === 'number') {
      setDropShadowOffsetY(value);
    }
  };

  const handleDropShadowBlurRadiusSliderChange = (
    e: Event,
    value: number | number[],
  ) => {
    if (typeof value === 'number') {
      setDropShadowBlurRadius(value);
    }
  };

  const handleDropShadowColorChange = (value: string) => {
    setDropShadowColor(value);
  };

  const handleBorderRadiusSliderChange = (
    e: Event,
    value: number | number[],
  ) => {
    if (typeof value === 'number') {
      setBorderRadius(value);
    }
  };

  const handleOpacitySliderChange = (e: Event, value: number | number[]) => {
    if (typeof value === 'number') {
      setOpacity(value);
    }
  };

  const handleBorderWidthSliderChange = (
    e: Event,
    value: number | number[],
  ) => {
    if (typeof value === 'number') {
      setBorderWidth(value);
    }
  };

  const handleBorderColorChange = (value: string) => {
    setBorderColor(value);
  };

  // compute the transform for flipping
  const scaleX = isFlipVertical ? -1 : 1;
  const scaleY = isFlipHorizontal ? -1 : 1;
  const transformValue =
    isFlipHorizontal || isFlipVertical
      ? `scale(${scaleX}, ${scaleY})`
      : undefined;

  const handleStyleSubmit = () => {
    let styleString = '';

    if (opacity !== 1) {
      styleString += `opacity: ${opacity}; `;
    }

    if (borderWidth !== 0) {
      styleString += `border-width: ${borderWidth}px; `;
      styleString += `border-style: ${borderStyle}; `;
      styleString += `border-color: ${borderColor}; `;
    }

    if (borderRadius !== 0) {
      styleString += `border-radius: ${borderRadius}px; `;
    }

    if (
      dropShadowOffsetX !== 0 ||
      dropShadowOffsetY !== 0 ||
      dropShadowBlurRadius !== 0
    ) {
      styleString += `filter: drop-shadow(${dropShadowOffsetX}px ${dropShadowOffsetY}px ${dropShadowBlurRadius}px ${dropShadowColor}); `;
    }

    // text-align is now handled via the textAlign attribute (toolbar controls), not the style string
    // if (alignment !== 'none' && alignment !== '') {
    //   styleString += `text-align: ${alignment}; `;
    // }

    if (transformValue) {
      styleString += `transform: ${transformValue}; `;
    }

    setImageStyle(styleString);
    onContentWidthSave(blockWidthValue === BLOCK_WIDTH_INHERIT ? undefined : blockWidthValue);
    setIsStyleDialogOpen(false);
  };

  const handleStyleCancel = () => {
    setIsStyleDialogOpen(false);
  };

  const handleAlignmentToggle = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null,
  ) => {
    setAlignment(newAlignment);
  };

  const handleBorderStyleSelect = (value: string) => {
    setBorderStyle(value);
  };

  return (
    <ModalDialog
      title="Edit Image Style"
      maxWidth="lg"
      buttons={['Cancel', 'Apply']}
      dialogProps={{
        open: isOpen,
      }}
      handleAction={(index: number) => {
        if (index === 0) {
          handleStyleCancel();
        } else {
          handleStyleSubmit();
        }
      }}
    >
      <div
        className="scrollingDiv"
        style={{ margin: 0, height: '100%', width: '1024px' }}
      >
        <Box
          sx={{
            width: '99%',
            overflowX: 'hidden',
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  width: '50%',
                }}
              >
                {/* Alignment is now handled via toolbar controls (textAlign attribute), not style string */}
                {/* <Grid
                  container
                  alignItems="center"
                  spacing={3}
                  sx={{ width: '100%' }}
                >
                  <Grid size={2}>
                    <Typography gutterBottom>Alignment</Typography>
                  </Grid>
                  <Grid size={10}>
                    <ToggleButtonGroup
                      value={alignment}
                      exclusive
                      onChange={handleAlignmentToggle}
                      aria-label="text alignment"
                    >
                      <ToggleButton value="" aria-label="not aligned">
                        <BlockIcon />
                      </ToggleButton>
                      <ToggleButton value="left" aria-label="left aligned">
                        <FormatAlignLeftIcon />
                      </ToggleButton>
                      <ToggleButton value="center" aria-label="centered">
                        <FormatAlignCenterIcon />
                      </ToggleButton>
                      <ToggleButton value="right" aria-label="right aligned">
                        <FormatAlignRightIcon />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>
                </Grid> */}

                <Grid
                  container
                  alignItems="center"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Grid size={2}>
                    <Typography gutterBottom>Opacity</Typography>
                  </Grid>
                  <Grid size={7}>
                    <Slider
                      size={'small'}
                      value={opacity}
                      aria-label="Opacity"
                      onChange={handleOpacitySliderChange}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                  </Grid>
                  <Grid size={3}>
                    <TextField
                      autoFocus
                      margin="dense"
                      type="number"
                      value={opacity}
                      fullWidth={false}
                      slotProps={{
                        input: {
                          inputProps: {
                            step: 0.1,
                            min: 0,
                            max: 1,
                          },
                        },
                      }}
                      onChange={(
                        event: ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >,
                      ) => {
                        const stringValue = event.target.value;
                        const numberValue = parseFloat(stringValue);

                        if (
                          !isNaN(numberValue) &&
                          numberValue >= 0 &&
                          numberValue <= 1
                        ) {
                          setOpacity(numberValue);
                        } else if (stringValue === '') {
                          // allows for clearing of the field
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid
                  container
                  alignItems="center"
                  spacing={3}
                  sx={{ width: '100%' }}
                >
                  <Grid size={2}>
                    <Typography>Flip</Typography>
                  </Grid>
                  <Grid size={5}>
                    <Typography variant="caption">Horizontal</Typography>
                    <Checkbox
                      name="flip-horizontal"
                      checked={isFlipHorizontal}
                      onChange={handleFlipHorizontalCheckboxChange}
                    />
                  </Grid>
                  <Grid size={5}>
                    <Typography variant="caption">Vertical</Typography>
                    <Checkbox
                      name="flip-vertical"
                      checked={isFlipVertical}
                      onChange={handleFlipVerticalCheckboxChange}
                    />
                  </Grid>
                </Grid>
              </Paper>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  width: '50%',
                }}
              >
                <Typography>Style Preview</Typography>
                <div
                  style={{
                    // alignment
                    textAlign: alignment
                      ? (alignment as CSSProperties['textAlign'])
                      : undefined,
                  }}
                >
                  <img
                    width={`${77 + borderWidth * 2}px`}
                    height={`${77 + borderWidth * 2}px`}
                    src={ImagePreviewPNG}
                    style={{
                      // opacity
                      opacity: opacity,

                      // flip
                      transform: transformValue ? transformValue : undefined,

                      // drop shadow styles
                      filter:
                        dropShadowOffsetX !== 0 ||
                        dropShadowOffsetY !== 0 ||
                        dropShadowBlurRadius !== 0
                          ? `drop-shadow(${dropShadowOffsetX}px ${dropShadowOffsetY}px ${dropShadowBlurRadius}px ${dropShadowColor})`
                          : undefined,

                      // border styles
                      borderStyle: borderStyle,
                      borderWidth: borderWidth,
                      borderColor: borderColor,
                      borderRadius: borderRadius,
                    }}
                  />
                </div>
              </Paper>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  width: '50%',
                }}
              >
                <Typography variant="body1">Border</Typography>
                <Grid
                  container
                  alignItems="center"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Grid size={2}>
                    <Typography variant="caption">Width</Typography>
                  </Grid>
                  <Grid size={7}>
                    <Slider
                      size={'small'}
                      value={borderWidth}
                      aria-label="Width"
                      onChange={handleBorderWidthSliderChange}
                      min={0}
                      max={20}
                      step={1}
                    />
                  </Grid>
                  <Grid size={3}>
                    <TextField
                      autoFocus
                      margin="dense"
                      name="border-width"
                      type="number"
                      value={borderWidth}
                      fullWidth={false}
                      slotProps={{
                        input: {
                          inputProps: {
                            step: 1,
                            min: 0,
                            max: 20,
                          },
                        },
                      }}
                      onChange={(
                        event: ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >,
                      ) => {
                        const stringValue = event.target.value;
                        const numberValue = parseFloat(stringValue);

                        if (
                          !isNaN(numberValue) &&
                          numberValue >= 0 &&
                          numberValue <= 20
                        ) {
                          setBorderWidth(numberValue);
                        } else if (stringValue === '') {
                          // allows for clearing of the field
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid
                  container
                  alignItems="center"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Grid size={2}>
                    <Typography variant="caption">Color</Typography>
                  </Grid>
                  <Grid size={10}>
                    <MuiColorInput
                      format="hex"
                      value={borderColor}
                      onChange={handleBorderColorChange}
                      isAlphaHidden={true}
                    />
                  </Grid>
                </Grid>

                <Grid
                  container
                  alignItems="center"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Grid size={2}>
                    <Typography variant="caption">Style</Typography>
                  </Grid>
                  <Grid size={10}>
                    <SelectorMainUi
                      defaultValue={borderStyle}
                      options={BorderStyles}
                      onSelect={handleBorderStyleSelect}
                    />
                  </Grid>
                </Grid>

                <Grid
                  container
                  alignItems="center"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Grid size={2}>
                    <Typography variant="caption">Radius</Typography>
                  </Grid>
                  <Grid size={7}>
                    <Slider
                      size={'small'}
                      value={borderRadius}
                      aria-label="Radius"
                      onChange={handleBorderRadiusSliderChange}
                      min={0}
                      max={50}
                      step={1}
                    />
                  </Grid>
                  <Grid size={3}>
                    <TextField
                      autoFocus
                      margin="dense"
                      name="border-radius"
                      type="number"
                      value={borderRadius}
                      fullWidth={false}
                      slotProps={{
                        input: {
                          inputProps: {
                            step: 1,
                            min: 0,
                            max: 50,
                          },
                        },
                      }}
                      onChange={(
                        event: ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >,
                      ) => {
                        const stringValue = event.target.value;
                        const numberValue = parseFloat(stringValue);

                        if (
                          !isNaN(numberValue) &&
                          numberValue >= 0 &&
                          numberValue <= 50
                        ) {
                          setBorderRadius(numberValue);
                        } else if (stringValue === '') {
                          // allows for clearing of the field
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  width: '50%',
                }}
              >
                <Typography variant="body1">Drop Shadow</Typography>
                <Grid
                  container
                  alignItems="center"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Grid size={2}>
                    <Typography variant="caption">Offset X</Typography>
                  </Grid>
                  <Grid size={7}>
                    <Slider
                      size={'small'}
                      value={dropShadowOffsetX}
                      aria-label="Offset X"
                      onChange={handleDropShadowOffsetXSliderChange}
                      min={-20}
                      max={20}
                      step={1}
                    />
                  </Grid>
                  <Grid size={3}>
                    <TextField
                      autoFocus
                      margin="dense"
                      name="drop-shadow-offset-x"
                      type="number"
                      value={dropShadowOffsetX}
                      fullWidth={false}
                      slotProps={{
                        input: {
                          inputProps: {
                            step: 1,
                            min: -20,
                            max: 20,
                          },
                        },
                      }}
                      onChange={(
                        event: ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >,
                      ) => {
                        const stringValue = event.target.value;
                        const numberValue = parseFloat(stringValue);

                        if (
                          !isNaN(numberValue) &&
                          numberValue >= -20 &&
                          numberValue <= 20
                        ) {
                          setDropShadowOffsetX(numberValue);
                        } else if (stringValue === '') {
                          // allows for clearing of the field
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid
                  container
                  alignItems="center"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Grid size={2}>
                    <Typography variant="caption">Offset Y</Typography>
                  </Grid>
                  <Grid size={7}>
                    <Slider
                      size={'small'}
                      value={dropShadowOffsetY}
                      aria-label="Offset Y"
                      onChange={handleDropShadowOffsetYSliderChange}
                      min={-20}
                      max={20}
                      step={1}
                    />
                  </Grid>
                  <Grid size={3}>
                    <TextField
                      autoFocus
                      margin="dense"
                      name="drop-shadow-offset-y"
                      type="number"
                      value={dropShadowOffsetY}
                      fullWidth={false}
                      slotProps={{
                        input: {
                          inputProps: {
                            step: 1,
                            min: -20,
                            max: 20,
                          },
                        },
                      }}
                      onChange={(
                        event: ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >,
                      ) => {
                        const stringValue = event.target.value;
                        const numberValue = parseFloat(stringValue);

                        if (
                          !isNaN(numberValue) &&
                          numberValue >= -20 &&
                          numberValue <= 20
                        ) {
                          setDropShadowOffsetY(numberValue);
                        } else if (stringValue === '') {
                          // allows for clearing of the field
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid
                  container
                  alignItems="center"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Grid size={2}>
                    <Typography variant="caption">Blur Radius</Typography>
                  </Grid>
                  <Grid size={7}>
                    <Slider
                      size={'small'}
                      value={dropShadowBlurRadius}
                      aria-label="Blur Radius"
                      onChange={handleDropShadowBlurRadiusSliderChange}
                      min={0}
                      max={20}
                      step={1}
                    />
                  </Grid>
                  <Grid size={3}>
                    <TextField
                      autoFocus
                      margin="dense"
                      type="number"
                      value={dropShadowBlurRadius}
                      fullWidth={false}
                      slotProps={{
                        input: {
                          inputProps: {
                            step: 1,
                            min: 0,
                            max: 20,
                          },
                        },
                      }}
                      onChange={(
                        event: ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >,
                      ) => {
                        const stringValue = event.target.value;
                        const numberValue = parseFloat(stringValue);

                        if (
                          !isNaN(numberValue) &&
                          numberValue >= 0 &&
                          numberValue <= 20
                        ) {
                          setDropShadowBlurRadius(numberValue);
                        } else if (stringValue === '') {
                          // allows for clearing of the field
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid
                  container
                  alignItems="center"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Grid size={2}>
                    <Typography variant="caption">Color</Typography>
                  </Grid>
                  <Grid size={10}>
                    <MuiColorInput
                      format="hex"
                      value={dropShadowColor}
                      onChange={handleDropShadowColorChange}
                      isAlphaHidden={true}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Stack>

            {/* Content Width section */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>Content Width</Typography>
              <Box style={{ display: 'flex', justifyContent: 'center' }}>
                <ToggleButtonGroup
                  value={blockWidthValue}
                  exclusive
                  onChange={(_, val: BlockWidthValue | null) => {
                    if (val !== null) setBlockWidthValue(val);
                  }}
                  size="small"
                  style={{ width: '60%' }}
                >
                  <ToggleButton value={BLOCK_WIDTH_INHERIT} style={{ flex: 1 }}>Lesson</ToggleButton>
                  <ToggleButton value={ContentWidthEnum.None} style={{ flex: 1 }}>None</ToggleButton>
                  <ToggleButton value={ContentWidthEnum.Small} style={{ flex: 1 }}>S</ToggleButton>
                  <ToggleButton value={ContentWidthEnum.Medium} style={{ flex: 1 }}>M</ToggleButton>
                  <ToggleButton value={ContentWidthEnum.Large} style={{ flex: 1 }}>L</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'center' }}>
                {blockWidthDescriptions[blockWidthValue]}
              </Typography>
            </Paper>
          </Stack>
        </Box>
      </div>
    </ModalDialog>
  );
};

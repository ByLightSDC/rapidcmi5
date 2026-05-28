import {
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import {
  BlockPaddingEnum,
  ContentWidthEnum,
  DefaultAlignmentEnum,
} from '@rapid-cmi5/cmi5-build-common';

import {
  blockPaddingDescriptions,
  contentWidthDescriptions,
  defaultAlignmentLabels,
} from '../../../drawers/constants';

import LogoUpload from './LogoUpload';

export type ThemeSettingsFormProps = {
  scopeLabel: string;
  logoCaption: string;

  contentWidth: ContentWidthEnum;
  blockPadding: BlockPaddingEnum;
  customPadding: number;
  defaultAlignment: DefaultAlignmentEnum;
  defaultActivityAlignment: DefaultAlignmentEnum;
  lightLogo: string;
  darkLogo: string;

  onSetContentWidth: (val: ContentWidthEnum) => void;
  onSetBlockPadding: (val: BlockPaddingEnum) => void;
  onSetCustomPadding: (val: number) => void;
  onSetDefaultAlignment: (val: DefaultAlignmentEnum) => void;
  onSetDefaultActivityAlignment: (val: DefaultAlignmentEnum) => void;
  onSetLightLogo: (path: string) => void;
  onSetDarkLogo: (path: string) => void;
};

export default function ThemeSettingsForm({
  scopeLabel,
  logoCaption,
  contentWidth,
  blockPadding,
  customPadding,
  defaultAlignment,
  defaultActivityAlignment,
  lightLogo,
  darkLogo,
  onSetContentWidth,
  onSetBlockPadding,
  onSetCustomPadding,
  onSetDefaultAlignment,
  onSetDefaultActivityAlignment,
  onSetLightLogo,
  onSetDarkLogo,
}: ThemeSettingsFormProps) {
  return (
    <>
      <Alert severity="info" sx={{ margin: 2 }}>
        {scopeLabel}
      </Alert>
      <Grid container sx={{ margin: 2 }}>
        {/* Content Width */}
        <Grid size={11.5}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Content Width
          </Typography>
          <ToggleButtonGroup
            value={contentWidth}
            exclusive
            onChange={(_, val) => {
              if (val !== null) onSetContentWidth(val);
            }}
            size="small"
            fullWidth
          >
            <ToggleButton value={ContentWidthEnum.None}>None</ToggleButton>
            <ToggleButton value={ContentWidthEnum.Small}>S</ToggleButton>
            <ToggleButton value={ContentWidthEnum.Medium}>M</ToggleButton>
            <ToggleButton value={ContentWidthEnum.Large}>L</ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {contentWidthDescriptions.get(contentWidth)}
          </Typography>
        </Grid>

        {/* Block Padding */}
        <Grid size={11.5} sx={{ mt: 2.5 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Block Padding
          </Typography>
          <ToggleButtonGroup
            value={blockPadding}
            exclusive
            onChange={(_, val) => {
              if (val !== null) onSetBlockPadding(val);
            }}
            size="small"
            fullWidth
          >
            <ToggleButton value={BlockPaddingEnum.None}>None</ToggleButton>
            <ToggleButton value={BlockPaddingEnum.Small}>S</ToggleButton>
            <ToggleButton value={BlockPaddingEnum.Medium}>M</ToggleButton>
            <ToggleButton value={BlockPaddingEnum.Large}>L</ToggleButton>
            <ToggleButton value={BlockPaddingEnum.Custom}>
              <MoreHorizIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {blockPaddingDescriptions.get(blockPadding)}
          </Typography>
          {blockPadding === BlockPaddingEnum.Custom && (
            <>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Top and Bottom
              </Typography>
              <Grid container alignItems="center" spacing={2}>
                <Grid size={9}>
                  <Slider
                    value={customPadding}
                    onChange={(_, val) => onSetCustomPadding(val as number)}
                    min={0}
                    max={64}
                    step={4}
                  />
                </Grid>
                <Grid size={3}>
                  <Typography variant="body2" textAlign="center">
                    {customPadding}
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
        </Grid>

        {/* Default Alignment */}
        <Grid size={11.5} sx={{ mt: 2.5 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Text Alignment
          </Typography>
          <ToggleButtonGroup
            value={defaultAlignment}
            exclusive
            onChange={(_, val) => {
              onSetDefaultAlignment(val as DefaultAlignmentEnum);
            }}
            size="small"
            fullWidth
          >
            <ToggleButton value={DefaultAlignmentEnum.Left}>Left</ToggleButton>
            <ToggleButton value={DefaultAlignmentEnum.Center}>
              Center
            </ToggleButton>
            <ToggleButton value={DefaultAlignmentEnum.Right}>
              Right
            </ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {defaultAlignmentLabels.get(defaultAlignment) ?? 'Left'} align text
          </Typography>
        </Grid>

        {/* Activity Alignment */}
        <Grid size={11.5} sx={{ mt: 2.5 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Activity Alignment
          </Typography>
          <ToggleButtonGroup
            value={defaultActivityAlignment}
            exclusive
            onChange={(_, val) => {
              onSetDefaultActivityAlignment(val as DefaultAlignmentEnum);
            }}
            size="small"
            fullWidth
          >
            <ToggleButton value={DefaultAlignmentEnum.Left}>Left</ToggleButton>
            <ToggleButton value={DefaultAlignmentEnum.Center}>
              Center
            </ToggleButton>
            <ToggleButton value={DefaultAlignmentEnum.Right}>
              Right
            </ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {defaultAlignmentLabels.get(defaultActivityAlignment) ?? 'Center'}{' '}
            align activities
          </Typography>
        </Grid>

        {/* Logo */}
        <Grid size={11.5} sx={{ mt: 2.5 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Logo
          </Typography>
          <LogoUpload
            lightLogoPath={lightLogo}
            darkLogoPath={darkLogo}
            onSetLightLogo={onSetLightLogo}
            onSetDarkLogo={onSetDarkLogo}
          />
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {logoCaption}
          </Typography>
        </Grid>
      </Grid>
    </>
  );
}

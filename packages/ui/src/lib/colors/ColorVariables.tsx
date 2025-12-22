// @ts-nocheck

import Grid from '@mui/material/Grid2';

import CircleIcon from '@mui/icons-material/Circle';

import { useEffect } from 'react';

import { Box, Divider, SxProps, Typography } from '@mui/material';
import { useTheme } from '@mui/material';

export function ColorVariables() {
  const currentThemeData = useTheme();

  useEffect(() => {
    //console.log('currentThemeData', currentThemeData);
  }, [currentThemeData]);

  return (
    <Grid container spacing={1} sx={{ padding: '0px' }}>
      <TopicDivider />
      <Header label="Interactive Colors" />
      <Circle
        color={currentThemeData.palette.primary.main}
        label="primary.main"
        value={currentThemeData.palette.primary.main}
      />
      <Circle
        color={currentThemeData.header.buttonColor}
        label="header.button"
        value={currentThemeData.header.buttonColor}
      />
      <Circle
        color={currentThemeData.header.hoverColor}
        label="header.button.hover"
        value={currentThemeData.header.hoverColor}
      />
      <Box
        sx={{
          minWidth: '64px',
          height: '120px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(180deg, #405CA7 0%, #2C4B93 100%)',
            minWidth: '48px',
            height: '32px',
            borderStyle: 'solid',
            borderWidth: '1px', //MG
            borderColor: 'primary.light',
            color: 'common.white',
            padding: '6px',
            margin: '4px',
          }}
        >
          <Typography
            color="text.primary"
            variant="caption"
            sx={{ position: 'relative', top: 24 }}
          >
            primary.button
          </Typography>
          {/* <Typography
            color="text.primary"
            variant="caption"
            sx={{ position: 'relative', top: 48 }}
          >
            linear-gradient(180deg, #405CA7 0%, #2C4B93 100%)
          </Typography> */}
        </Box>
      </Box>
      <Box
        sx={{
          marginLeft: '24px',
          background: (theme: any) => `${theme?.card?.default}`,
          borderColor: (theme: any) => `${theme?.card?.borderColor}`,
          borderWidth: '2px',
          borderRadius: '12px',
          height: '64px',
          width: '100px',
          display: 'flex',
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'flex-end',
        }}
      >
        <Typography
          color="text.primary"
          variant="caption"
          sx={{ position: 'relative', top: 24 }}
        >
          card.default
        </Typography>
      </Box>
      <Divider
        color="pink"
        sx={{
          backgroundColor: 'green',
          marginBottom: '12px',
          marginTop: '12px',
        }}
      />
      <TopicDivider />
      <Header label="Background Colors" sxProps={{ marginTop: '0px' }} />
      <Circle
        color="background.default"
        label="background.default"
        value={currentThemeData.palette.background.default}
      />
      <Circle
        color="background.paper"
        label="background.paper"
        value={currentThemeData.palette.background.paper}
      />
      <Circle
        color={currentThemeData.header.default}
        label="header.default"
        value={currentThemeData.header.default}
      />
      <Circle
        color={currentThemeData.accordion.backgroundColor}
        label="accordion.background"
        value={currentThemeData.accordion.backgroundColor}
      />
      <Circle
        color={currentThemeData.input.fill}
        label="input.fill"
        value={currentThemeData.input.fill}
      />

      <TopicDivider />
      <Header label="Text Colors" />
      <Circle
        color={currentThemeData.palette.text.primary}
        label="text.primary"
        value={currentThemeData.palette.text.primary}
      />
      <Circle
        color={currentThemeData.palette.text.disabled}
        label="text.disabled"
        value={currentThemeData.palette.text.disabled}
      />

      <Circle color="text.hint" label="text.hint" value="#656565" />
      <Circle
        color={currentThemeData.card.titleColor}
        label="card.title"
        value="#656565" //TODO fix
      />
      <TopicDivider />
      <Header label="Other" />
      <Circle color="common.white" label="common.white" value={'#FFFFFF'} />
      <Circle color="info.main" label="info.main" />
      <Circle color="warning.main" label="warning.main" />
      <Circle color="error.main" label="error.main" />
      <Circle color="success.main" label="success.main" />
      <TopicDivider />
    </Grid>
  );
}
export default ColorVariables;

function Header({ label, sxProps }: { label: string; sxProps?: SxProps }) {
  return (
    <Grid size={12} sx={{ marginTop: '24px', ...sxProps }}>
      <Typography variant="h4" sx={{ padding: '8px' }}>
        {label}
      </Typography>
    </Grid>
  );
}

function TopicDivider() {
  return (
    <Grid size={12}>
      <Divider sx={{ marginTop: '12px', marginBottom: '0px' }} />
    </Grid>
  );
}

function Circle({
  color = 'pink',
  label,
  shouldBox,
  value,
}: {
  color?: any;
  label?: string;
  shouldBox?: boolean;
  value?: any;
}) {
  return (
    <Grid
      size={2}
      sx={{
        color: color,
        fontSize: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        alignContent: 'center',
      }}
    >
      <CircleIcon
        color="inherit"
        fontSize="inherit"
        sx={{
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: shouldBox ? 'darkgrey' : 'background.paper',
        }}
      />
      <Typography
        variant="caption"
        color="text.primary"
        sx={{
          width: 'auto',
          //backgroundColor:'green',
          //maxWidth: '72px',
          lineHeight: 1,
          whiteSpace: 'pre-line',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        {label || color}
      </Typography>
      {value && (
        <Typography
          variant="caption"
          color="text.primary"
          sx={{
            marginTop: '6px',
            width: 'auto',
            maxWidth: '72px',
            lineHeight: 1,
            whiteSpace: 'pre-line',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {value as string}
        </Typography>
      )}
    </Grid>
  );
}

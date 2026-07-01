import LinearProgress, {
  LinearProgressProps,
} from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useSelector } from 'react-redux';
import { courseAUProgressSel } from '../redux/auReducer';
import { SxProps } from '@mui/system';
import { RC5LinearProgress } from './RC5ProgressBar';

// Custom props destructured out to prevent spreading them as DOM attributes (fillcolor, sxprops, etc.) on LinearProgress.
function LinearProgressWithLabel({
  fillColor,
  completeFillColor,
  sxProps,
  textProps,
  value,
  ...linearProgressProps
}: LinearProgressProps & {
  fillColor?: string;
  completeFillColor?: string;
  sxProps?: SxProps;
  textProps?: SxProps;
  value: number;
}) {
  // pointerEvents: none in RC5LinearProgress wrap prevents NVDA from announcing the progress bar as 'clickable'
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        ml: 1,
      }}
    >
      <Box
        sx={{
          width: '90%',
          mr: 1,
          color:
            value === 100
              ? (completeFillColor ?? 'success')
              : (fillColor ?? 'primary'),
        }}
      >
        <RC5LinearProgress
          variant="determinate"
          aria-label="Course Progress"
          value={value}
          {...linearProgressProps}
          sx={{
            borderRadius: 5,
            color: 'inherit',
            height: 10,
            ...sxProps,
          }}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          aria-hidden="true"
          variant="body2"
          sx={{ fontWeight: 700, color: 'text.primary', ...textProps }}
        >
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ProgressBar({
  fillColor,
  completeFillColor,
  sxProps,
  textProps,
}: {
  fillColor?: string;
  completeFillColor?: string;
  sxProps?: SxProps;
  textProps?: SxProps;
}) {
  const courseAUProgress = useSelector(courseAUProgressSel);
  const auProgress = courseAUProgress?.progress?.auProgress ?? 0;

  return (
    <Box
      sx={{
        width: '80%',
        margin: 'auto',
        paddingY: 0,
        marginTop: '0px',
        marginBottom: '1rem',
      }}
    >
      <Box sx={{ minHeight: '8px' }} />
      <LinearProgressWithLabel
        fillColor={fillColor}
        completeFillColor={completeFillColor}
        sxProps={sxProps}
        textProps={textProps}
        value={80} //{auProgress}
      />
    </Box>
  );
}

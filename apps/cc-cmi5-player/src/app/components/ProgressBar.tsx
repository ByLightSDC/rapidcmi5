import LinearProgress, {
  LinearProgressProps,
} from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useSelector } from 'react-redux';
import { courseAUProgressSel } from '../redux/auReducer';
import { SxProps } from '@mui/system';

function LinearProgressWithLabel(
  props: LinearProgressProps & {
    fillColor?: string;
    completeFillColor?: string;
    sxProps?: SxProps;
    textProps?: SxProps;
    value: number;
  },
) {
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
            props.value === 100
              ? (props.completeFillColor ?? 'success')
              : (props.fillColor ?? 'primary'),
        }}
      >
        <LinearProgress
          variant="determinate"
          aria-label="Course Progress"
          {...props}
          sx={{
            borderRadius: 5,
            color: 'inherit',
            height: 10,
            ...props.sxProps,
          }}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          aria-hidden="true"
          variant="body2"
          sx={{ fontWeight: 700, color: 'text.primary', ...props.textProps }}
        >
          {`${Math.round(props.value)}%`}
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
     <Box sx={{minHeight:'8px'}}/>
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

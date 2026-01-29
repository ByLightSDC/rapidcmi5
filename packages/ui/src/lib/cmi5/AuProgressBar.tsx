import LinearProgress, {
  LinearProgressProps,
} from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number },
) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box sx={{ width: '90%', mr: 1 }}>
        <LinearProgress
          variant="determinate"
          color={props.value === 100 ? 'success' : 'primary'}
          {...props}
          sx={{
            borderRadius: 5,
            height: 10,
          }}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" sx={{ color: 'white' }}>
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

export default function LinearWithValueLabel({ value }: { value: number }) {
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
      <LinearProgressWithLabel value={value} />
    </Box>
  );
}

import LinearProgress from '@mui/material/LinearProgress';

export function LinearProgressDisplayUi() {
  return (
    <div data-testid="linear-progress-loader">
      <LinearProgress
        color="inherit"
        sx={{
          color: (theme: any) => `${theme.header.light}`,
        }}
      />
    </div>
  );
}

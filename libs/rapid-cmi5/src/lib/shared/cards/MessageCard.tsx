import { MessageCardProps } from '../../types/cardTypes';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import Typography from '@mui/material/Typography';

export default function MessageCard({ props }: { props: MessageCardProps }) {
  return (
    <form>
      <Paper className="paper-message" variant="outlined">
        <Box className="box-message">
          <Grid container columns={1} direction="column" wrap="nowrap">
            {/* Title */}
            {props.title && (
              <Grid item xs={12}>
                {' '}
                <Typography align="center" variant="h3">
                  {props.title}
                </Typography>
              </Grid>
            )}
            {/* Subtitle */}
            {props.subtitle && (
              <Grid item xs={12} margin={1}>
                <Typography align="center" variant="h4">
                  {props.subtitle}
                </Typography>
              </Grid>
            )}
            {props.message && (
              <Grid item xs={12} margin={1}>
                <Typography align="center" variant="body1">
                  {props.message}
                </Typography>
              </Grid>
            )}
          </Grid>
          {props.children}
        </Box>
      </Paper>
    </form>
  );
}

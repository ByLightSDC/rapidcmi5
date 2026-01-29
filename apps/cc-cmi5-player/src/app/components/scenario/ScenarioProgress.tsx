import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import { Gauge } from '@mui/x-charts/Gauge';

import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import { Box } from '@mui/system';

import { auCompletionDivWidth } from './constants';
import { AuAutoGrader } from '@rapid-cmi5/cmi5-build-common';

// REFACTOR
function ScenarioProgress({
  labProgress,
  autoGraders,
  finishedTasks,
}: {
  labProgress: number;
  autoGraders: AuAutoGrader[];
  finishedTasks: Set<string>;
}) {
  return (
    <div className="mx-auto">
      {autoGraders && (
        <>
          <div className="w-full">
            <div className="w-[50vw] max-w-[250px] h-[50vw] max-h-[200px] mx-auto">
              <Gauge
                value={labProgress}
                startAngle={-90}
                endAngle={90}
                cornerRadius={5}
                sx={{
                  color: 'white',
                  '& .MuiGauge-valueText': {
                    fontSize: '1.5em',
                    transform: 'translate(0px, -30px)',
                    fontWeight: 'bold',
                  },
                  '& .MuiGauge-valueArc': {
                    fill: () => (labProgress === 100 ? ' #15803D' : '#157CE9'),
                  },
                  '& .MuiGauge-referenceArc': {
                    fill: '#072AA7', // Remaining progress in light blue
                  },
                }}
                text={({ value }) => `${value}%`}
              />
            </div>
          </div>

          <Paper variant="outlined">
            <List disablePadding>
              {autoGraders.map((autoGrader: AuAutoGrader, index: number) => (
                <Box key={index}>
                  <ListItem
                    sx={{ margin: '0px' }}
                    secondaryAction={
                      finishedTasks.has(autoGrader.uuid) ? (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: auCompletionDivWidth,
                          }}
                        >
                          <CheckCircleIcon
                            color="success"
                            sx={{ fontSize: 24 }}
                          />
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                              padding: '4px',
                            }}
                          >
                            Completed
                          </Typography>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: auCompletionDivWidth,
                          }}
                        >
                          <HourglassBottomIcon
                            color="info"
                            sx={{
                              fontSize: 24,
                            }}
                          />
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                              padding: '4px',
                            }}
                          >
                            Not Completed
                          </Typography>
                        </div>
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          padding: '2px',
                        }}
                      >
                        {index + 1}
                      </Typography>
                    </ListItemAvatar>
                    <ListItemText primary={autoGrader.name} />
                  </ListItem>
                  <ListItem sx={{ paddingLeft: 9, margin: '0px' }}>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontStyle="italic"
                        >
                          {autoGrader.question}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < autoGraders.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </>
      )}
    </div>
  );
}

export default ScenarioProgress;

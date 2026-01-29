import { useState } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Collapse,
  Paper,
  Divider,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';

export default function LrsHeaderWithDetails({
  activityType,
}: {
  activityType: RC5ActivityTypeEnum;
}) {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((v) => !v);

  return (
    <Box sx={{ overflowAnchor: 'none' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'primary.main',
          borderRadius: '5px',
          p: 1,
          color: 'white',
          cursor: 'pointer',
        }}
        onClick={toggle}
        aria-expanded={open}
        aria-controls="lrs-details"
        role="button"
      >
        <Tooltip
          title="Click to see what LRS statements are and why they matter."
          arrow
          placement="right"
        >
          <IconButton
            size="small"
            sx={{ color: 'inherit', p: 0.5, mr: 0.5 }}
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
            aria-label="Toggle LRS details"
          >
            <SchoolIcon sx={{ mr: 0.5 }} />
          </IconButton>
        </Tooltip>

        <Typography variant="subtitle1" sx={{ mr: 1, flexGrow: 1 }}>
          {activityType} Activity LRS Statements
        </Typography>

        <ExpandMoreIcon
          sx={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
          }}
          aria-hidden
        />
      </Box>

      <Collapse
        in={open}
        timeout="auto"
        unmountOnExit
        collapsedSize={0} 
        sx={{ overflowAnchor: 'none' }} 
      >
        <Paper
          id="lrs-details"
          elevation={0}
          sx={{
            mt: 1,
            p: 2,
            borderRadius: '6px',
            border: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: 'background.paper',
            maxHeight: 360, 
            overflow: 'auto', 
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            What is an LRS statement?
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            An LRS (Learning Record Store) statement is an xAPI record of a
            learner&apos;s action, like{' '}
            <i>“Alice completed Module 1 with score 92%.”</i> These statements
            help track progress, completions, scores, and time-on-task across
            systems.
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          <Typography variant="subtitle2" gutterBottom>
            Typical statement fields
          </Typography>
          <Typography variant="body2" component="div">
            <ul style={{ margin: 0, paddingInlineStart: 18 }}>
              <li>
                <b>Actor</b>: Who did it (e.g., the learner).
              </li>
              <li>
                <b>Verb</b>: What they did (e.g., “completed”, “answered”).
              </li>
              <li>
                <b>Object</b>: What it was done to (e.g., an activity or AU).
              </li>
              <li>
                <b>Result</b>: Outcomes (score, success, duration).
              </li>
              <li>
                <b>Context/Extensions</b>: Extra metadata (e.g., KSAT skills).
              </li>
            </ul>
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          {activityType === RC5ActivityTypeEnum.quiz && (
            <Typography variant="body2" component="div">
              When a student submits a <b>quiz</b> or <b>capture-the-flag</b>{' '}
              activity, the CMI5 player sends a separate statement to the LRS
              for each question. These use the verb ID{' '}
              <code>http://adlnet.gov/expapi/verbs/answered</code> (commonly
              shortened to <i>answered</i>).
              <br />
              <br />
              After all question-level statements are recorded, the player sends
              a summary statement for the overall activity — including the
              student’s final grade. This consists of an{' '}
              <b>activityCompleted</b> statement, followed by either an{' '}
              <b>activityPassed</b> or <b>activityFailed</b> statement.
              <br />
              <br />
              These final statements include both <b>score data</b> and any{' '}
              <b>KSATs</b> (Knowledge, Skills, Abilities, and Tasks) associated
              with the activity.
              <br />
              <br />
              <b>Summary of Statements</b>
              <ul style={{ margin: 0, paddingInlineStart: 18 }}>
                <li>
                  <b>answered</b> — sent for each question a student responds
                  to.
                </li>
                <li>
                  <b>activityCompleted</b> — marks the overall quiz as finished.
                </li>
                <li>
                  <b>activityPassed</b> / <b>activityFailed</b> — indicates
                  whether the student’s final score met the passing threshold.
                </li>
              </ul>
            </Typography>
          )}

          {activityType === RC5ActivityTypeEnum.scenario && (
            <Typography variant="body2" component="div">
              When a student enters an AU (Assignable Unit) linked to a{' '}
              <b>scenario</b>, the LRS first receives a statement with the verb{' '}
              <b>rangeos-ok</b>. This verifies that the learner has permission
              to access the scenario.
              <br />
              <br />
              As the scenario runs, the LRS records a <b>scenarioEvent</b>{' '}
              statement each time the student performs an action such as opening
              a console or triggering an event.
              <br />
              <br />
              If the scenario has <b>no autograders</b>, the student is marked
              as complete immediately upon starting the scenario. However, if{' '}
              <b>autograders</b> are present, all of them must be completed
              before the AU counts the slide as complete.
              <br />
              <br />
              Once the scenario is finished, the CMI5 player sends both an{' '}
              <b>activityPassed</b> and an <b>activityCompleted</b> statement.
              Additionally, when a student completes an autograder task, the LRS
              records an <b>answered</b> statement.
              <br />
              <br />
              <b>Summary of Statements</b>
              <ul style={{ margin: 0, paddingInlineStart: 18 }}>
                <li>
                  <b>rangeos-ok</b> — verifies learner access to the scenario.
                </li>
                <li>
                  <b>scenarioEvent</b> — logs actions within the scenario (e.g.,
                  opening a console, triggering an event).
                </li>
                <li>
                  <b>answered</b> — records responses to individual autograder
                  tasks.
                </li>
                <li>
                  <b>activityCompleted</b> — marks the scenario as complete.
                </li>
                <li>
                  <b>activityPassed</b> — indicates the learner successfully
                  completed the scenario requirements.
                </li>
              </ul>
            </Typography>
          )}

          {activityType === RC5ActivityTypeEnum.consoles && (
            <Typography variant="body2" component="div">
              When a student launches an AU that includes a{' '}
              <b>console-based scenario</b>, the process begins with the LRS
              receiving a <b>rangeos-ok</b> statement to verify the learner’s
              access.
              <br />
              <br />
              The next event sent is a <b>scenarioEvent</b>, which occurs
              whenever the learner interacts with the console or performs an
              in-scenario action.
              <br />
              <br />
              For scenarios <b>without autograders</b>, completion is registered
              as soon as the scenario begins. For those <b>with autograders</b>,
              all autograder tasks must be successfully completed before the
              slide is marked as complete.
              <br />
              <br />
              Once finished, the CMI5 player transmits both{' '}
              <b>activityPassed</b> and <b>activityCompleted</b> statements to
              the LRS.
              <br />
              <br />
              <b>Summary of Statements</b>
              <ul style={{ margin: 0, paddingInlineStart: 18 }}>
                <li>
                  <b>rangeos-ok</b> — verifies that the learner can access the
                  console scenario.
                </li>
                <li>
                  <b>scenarioEvent</b> — tracks interactions within the console
                  (e.g., running commands or actions).
                </li>
                <li>
                  <b>activityCompleted</b> — marks the scenario as finished.
                </li>
                <li>
                  <b>activityPassed</b> — confirms successful completion.
                </li>
              </ul>
            </Typography>
          )}
        </Paper>
      </Collapse>
    </Box>
  );
}

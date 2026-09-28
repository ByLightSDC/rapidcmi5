import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { ModalDialog } from '@rapid-cmi5/ui';
import { useDispatch, useSelector } from 'react-redux';

import { auJsonSel } from '../redux/auReducer';
import { setActiveTab } from '../redux/navigationReducer';
import {
  clearUnitResult,
  unitResultSel,
} from '../redux/progressNotificationReducer';

const CONTINUE_BUTTON_INDEX = 1;

/**
 * Shown once, on the transition into a completed or passed AU, with the same
 * averaged grade the player reports to the LRS.
 */
export default function UnitResultDialog() {
  const unitResult = useSelector(unitResultSel);
  const auJson = useSelector(auJsonSel);
  const dispatch = useDispatch();

  if (!unitResult) return null;
  const passed = unitResult.outcome === 'passed';

  const handleAction = (index: number) => {
    dispatch(clearUnitResult());

    if (index === CONTINUE_BUTTON_INDEX) {
      // The synthetic exit slide always sits one past the last real slide.
      dispatch(setActiveTab(auJson?.slides?.length ?? 0));
    }
  };

  return (
    <ModalDialog
      testId="unit-result-dialog"
      title={
        <Stack direction="row" sx={{ alignItems: 'center', gap: '8px' }}>
          <CheckCircleOutlineIcon color={passed ? 'success' : 'primary'} />
          {passed ? 'Unit passed' : 'Unit complete'}
        </Stack>
      }
      buttons={['Keep reviewing', 'Continue to exit']}
      dialogProps={{ open: true, fullWidth: true, maxWidth: 'sm' }}
      handleAction={handleAction}
    >
      <Stack
        direction="column"
        sx={{ padding: '0px 24px', gap: '18px' }}
        data-testid="unit-result-body"
      >
        <Typography variant="body1" color="text.primary">
          {unitResult.auTitle}
        </Typography>

        {unitResult.gradePercent !== undefined && (
          <Stack direction="column">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ letterSpacing: '1.2px', fontWeight: 700 }}
            >
              {passed ? 'FINAL GRADE' : 'GRADE'}
            </Typography>
            <Typography
              data-testid="unit-result-grade"
              color="text.primary"
              sx={{ fontSize: '48px', fontWeight: 700, lineHeight: 1.1 }}
            >
              {`${unitResult.gradePercent}%`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`Averaged across your ${unitResult.scoredActivityCount} scored ${
                unitResult.scoredActivityCount === 1 ? 'activity' : 'activities'
              }.`}
            </Typography>
          </Stack>
        )}

        {unitResult.activities.length > 0 && (
          <Stack direction="column">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ letterSpacing: '1.2px', fontWeight: 700, paddingBottom: 1 }}
            >
              HOW IT ADDS UP
            </Typography>
            {unitResult.activities.map((activity) => (
              <Box key={activity.id}>
                <Divider />
                <Stack
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    gap: '12px',
                    paddingY: '8px',
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: '66px' }}
                  >
                    {activity.slideLabel}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ flexGrow: 1 }}
                  >
                    {activity.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ fontWeight: 700 }}
                  >
                    {activity.scoreLabel}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </ModalDialog>
  );
}

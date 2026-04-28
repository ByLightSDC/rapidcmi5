import { useCallback, useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { Stack, Tooltip, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { classIdSel, studentIdSel } from '../../redux/auReducer';
import { cmi5Instance } from '../../session/cmi5';
import { classChangeModalId } from '../CourseModals';
import {
  ButtonInfoField,
  ButtonInfoFormHeaderLayout,
  ButtonMainUi,
  setModal,
} from '@rapid-cmi5/ui';
import { CustomTheme } from '../../styles/createPalette';
import { TOOLTIP_ENTER_DELAY, TOOLTIP_ENTER_NEXT_DELAY } from './shared';

const featureFlagChangeClassRoom = false;

export default function StudentInfoButton() {
  const dispatch = useDispatch();
  const classId = useSelector(classIdSel);
  const studentId = useSelector(studentIdSel);

  const userName = cmi5Instance.getLaunchParameters().actor?.account?.name;
  const regId = cmi5Instance.getLaunchParameters().registration;

  const [password, setPassword] = useState('');
  const [clearUserName, setCleanUserName] = useState('');

  const getStrippedUserName = useCallback((inputName: string) => {
    const pcteCharindex = inputName.indexOf('@pcte.mil');
    if (pcteCharindex >= 0) {
      const cleanName = inputName.substring(0, pcteCharindex);
      setCleanUserName(cleanName);
      setPassword(`${cleanName}!`);
    } else {
      setCleanUserName(inputName);
      setPassword('');
    }
  }, []);

  useEffect(() => {
    if (userName) getStrippedUserName(userName);
  }, [userName, getStrippedUserName]);

  const infoRows = (
    <Stack direction="column" sx={{ display: 'flex' }}>
      {studentId && (
        <Typography variant="caption">Student Id:{studentId}</Typography>
      )}
      <Typography variant="caption">Registration Id:{regId}</Typography>
      {classId && <Typography variant="caption">Class Id:{classId}</Typography>}
      <Typography variant="caption">User Name:{clearUserName}</Typography>
      {password && (
        <Typography variant="caption">Password:{password}</Typography>
      )}
    </Stack>
  );

  if (featureFlagChangeClassRoom) {
    return (
      <ButtonInfoField
        alertSxProps={{
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: (theme: CustomTheme) => `${theme.input.outlineColor}`,
          color: 'white',
        }}
        infoIcon={<AccountCircleIcon fontSize="inherit" color="primary" />}
        name="account-info-icon"
        message={
          <Stack direction="column" sx={{ display: 'flex', marginLeft: '8px' }}>
            {studentId && (
              <Typography variant="caption">Student Id: {studentId}</Typography>
            )}
            <Typography variant="caption">Registration Id: {regId}</Typography>
            {classId && (
              <Typography variant="caption">Class Id: {classId}</Typography>
            )}
            <Typography variant="caption">User Name:{clearUserName}</Typography>
            {password && (
              <Typography variant="caption">Password:{password}</Typography>
            )}
            {classId && (
              <div>
                <ButtonMainUi
                  startIcon={<AssignmentIndIcon />}
                  onClick={() => {
                    dispatch(
                      setModal({ type: classChangeModalId, id: '', name: '' }),
                    );
                  }}
                >
                  Change ClassRoom
                </ButtonMainUi>
              </div>
            )}
          </Stack>
        }
        props={{ sx: ButtonInfoFormHeaderLayout }}
        triggerOnClick={true}
      />
    );
  }

  return (
    <IconButton aria-label="Student Information" color="primary">
      <Tooltip
        enterDelay={TOOLTIP_ENTER_DELAY}
        enterNextDelay={TOOLTIP_ENTER_NEXT_DELAY}
        sx={{ maxWidth: '480px' }}
        title={infoRows}
      >
        <AccountCircleIcon />
      </Tooltip>
    </IconButton>
  );
}

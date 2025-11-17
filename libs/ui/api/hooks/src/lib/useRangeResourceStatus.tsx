import { RangeStatusEnum } from '@rangeos-nx/frontend/clients/devops-api';

/* Branded */
import { ButtonInfoField } from '@rangeos-nx/ui/branded';

/* Icons*/
import DangerousIcon from '@mui/icons-material/Dangerous';
import DoneIcon from '@mui/icons-material/Done';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ClearIcon from '@mui/icons-material/Clear';
import ErrorIcon from '@mui/icons-material/Error';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

//OLD - but used by User Portal
//TODO -- maybe status.tsx in infrastructure portal should be moved to branded lib?
export const useRangeResourceStatus = (
  statusCondition: string | undefined,
  statusMessage?: string,
) => {
  const errorIcon = <ErrorOutlineIcon color="error" />;
  if (statusCondition) {
    switch (statusCondition) {
      case RangeStatusEnum.Ready:
        //#REF return { icon: <DoneIcon />, label: 'Ready' };
        // don't show status info if ready
        return { icon: <></>, label: '' };
      case RangeStatusEnum.NotReady:
        if (statusMessage) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <HourglassBottomIcon />, severity: 'info' }}
                boxProps={{ width: '24px', height: '24px' }}
                infoIcon={<HourglassBottomIcon />}
                name="info-status-icon"
                message={statusMessage}
              />
            ),
            label: 'Not Ready',
          };
        }
        return { icon: <HourglassBottomIcon />, label: 'Not Ready' };
      case RangeStatusEnum.Creating:
        return { icon: <AutorenewIcon />, label: 'Deploying' };
      case RangeStatusEnum.Error:
        if (statusMessage) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: errorIcon, severity: 'error' }}
                boxProps={{ width: '24px', height: '24px' }}
                infoIcon={errorIcon}
                name="error-status-icon"
                message={statusMessage}
              />
            ),
            label: 'Error',
          };
        }
        return { icon: <ErrorIcon />, label: 'Error' };
      case RangeStatusEnum.Deleting:
        return { icon: <ClearIcon />, label: 'Deleting' };
      case RangeStatusEnum.Stopped:
        return { icon: <DangerousIcon />, label: 'Stopped' };
      default:
        return { icon: <QuestionMarkIcon />, label: 'Unknown' };
    }
  }
  return { icon: <QuestionMarkIcon />, label: 'Unknown' };
};

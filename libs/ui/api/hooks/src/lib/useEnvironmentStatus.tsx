import { RangeStatusEnum } from '@rangeos-nx/frontend/clients/devops-api';

/* Branded */
import { ButtonInfoField } from '@rangeos-nx/ui/branded';

/* Icons*/
import DoneIcon from '@mui/icons-material/Done';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ClearIcon from '@mui/icons-material/Clear';
import ErrorIcon from '@mui/icons-material/Error';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

/**
 * Returns JSX Element representing environment state
 * Note that environment.status in be is type Object, but
 * it happens to mirror Range Resource Status so we are
 * using that type as a placeholder
 * @param {string} statusCondition Status Condition
 * @param {string} [statusMessage] Status Message
 * @return {JSX.Element} React Element with icon & label
 */
export const useEnvironmentStatus = () => {
  const getStatus = (
    statusCondition: string | undefined,
    statusMessage?: string,
  ) => {
    const errorIcon = <ErrorOutlineIcon color="error" />;
    if (statusCondition) {
      switch (statusCondition) {
        case RangeStatusEnum.Ready:
          return { icon: <DoneIcon />, label: 'Ready' };
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
        default:
          return { icon: <QuestionMarkIcon />, label: 'Unknown' };
      }
    }
    return { icon: <QuestionMarkIcon />, label: 'Unknown' };
  };

  return { getStatus };
};

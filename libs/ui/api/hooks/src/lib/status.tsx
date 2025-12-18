/* Branded */
// eslint-disable-next-line @nx/enforce-module-boundaries

/* Icons*/
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DangerousIcon from '@mui/icons-material/Dangerous';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DoneIcon from '@mui/icons-material/Done';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
//
import {
  DeployedPackageDetailStatusEnum,
  DeployedRangeConsoleStatusEnum,
  DeployedScenarioDetailStatusEnum,
  GhostMachineStatusEnum,
  GhostMachineStatusUpEnum,
  RangeContainerStatusEnum,
  RangeStatusEnum,
  RangeVMStatusEnum,
  RangeVMKubevirtVmStatusEnum,
} from '@rapid-cmi5/frontend/clients/devops-api';
import { ButtonInfoField } from './utils/buttons';

/** @constant
 * Error Icon with Outline Style
 *  @type {JSX.Element}
 */
const errorIcon = <ErrorOutlineIcon color="error" />;
const doneIcon = <CheckCircleIcon />;
// display "double" icon when resource is deleting
const deletingIcon = (
  <div style={{ display: 'flex', flexDirection: 'row' }}>
    <AutorenewIcon fontSize="inherit" />
    <DeleteIcon fontSize="inherit" sx={{ marginLeft: '-5px' }} />
  </div>
);
const boxProps = { width: '24px', height: 'auto' };

/**
 * Icon for Displaying Console Status
 * @param {DeployedRangeConsoleStatusEnum | undefined} statusCondition Status
 * @param {string} [statusMessage] Message
 * @param {boolean} [showColors] Whether to inject color property based on status
 * @param {boolean} [showHover] Whether to display button with alert field for status message / status
 * @returns {} {icon: JSX.Element, label: string}
 */
export const getConsoleStatusIcon = (
  statusCondition: DeployedRangeConsoleStatusEnum | undefined,
  statusMessage?: string,
  showColors?: boolean,
  showHover?: boolean,
) => {
  if (statusCondition) {
    switch (statusCondition) {
      case DeployedRangeConsoleStatusEnum.Creating:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <AutorenewIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <AutorenewIcon
                    fontSize="inherit"
                    color={showColors ? 'info' : undefined}
                  />
                }
                name="warning-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <AutorenewIcon //#REF map: HourglassBottmIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: statusCondition,
        };
      case DeployedRangeConsoleStatusEnum.Deleting:
        return {
          icon: deletingIcon,
          label: statusCondition,
        };
      case DeployedRangeConsoleStatusEnum.Ready:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: doneIcon, severity: 'success' }}
                boxProps={boxProps}
                infoIcon={
                  <CheckCircleIcon
                    fontSize="inherit"
                    color={showColors ? 'success' : undefined}
                  />
                }
                name="success-status-icon"
                message={statusMessage || 'Running'}
              />
            ),
            label: 'Running',
          };
        }
        return {
          icon: (
            <CheckCircleIcon
              fontSize="inherit"
              color={showColors ? 'success' : undefined}
            />
          ),
          label: 'Running',
        };
      case DeployedRangeConsoleStatusEnum.Error:
        // special case (per BE) that container is in process of resuming or pausing
        if (statusMessage === 'Reconcile started') {
          if (showHover) {
            return {
              icon: (
                <ButtonInfoField
                  alertProps={{
                    icon: <HourglassBottomIcon />,
                    severity: 'info',
                  }}
                  boxProps={boxProps}
                  infoIcon={
                    <HourglassBottomIcon
                      fontSize="inherit"
                      color={showColors ? 'info' : undefined}
                    />
                  }
                  name="info-status-icon"
                  message={statusMessage}
                />
              ),
              label: 'Reconcile started',
            };
          }
          return {
            icon: (
              <HourglassBottomIcon
                fontSize="inherit"
                color={showColors ? 'info' : undefined}
              />
            ),
            label: 'Reconcile started',
          };
        }
        // special case (per BE) that container is in process of resuming or pausing
        if (statusMessage?.startsWith('Pod ')) {
          if (showHover) {
            return {
              icon: (
                <ButtonInfoField
                  alertProps={{
                    icon: <HourglassBottomIcon />,
                    severity: 'info',
                  }}
                  boxProps={boxProps}
                  infoIcon={
                    <HourglassBottomIcon
                      fontSize="inherit"
                      color={showColors ? 'info' : undefined}
                    />
                  }
                  name="info-status-icon"
                  message={statusMessage}
                />
              ),
              label: 'Pod not ready',
            };
          }
          return {
            icon: (
              <HourglassBottomIcon
                fontSize="inherit"
                color={showColors ? 'info' : undefined}
              />
            ),
            label: 'Pod not ready',
          };
        }
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: errorIcon, severity: 'error' }}
                boxProps={boxProps}
                infoIcon={
                  <ErrorOutlineIcon
                    fontSize="inherit"
                    color={showColors ? 'error' : undefined}
                  />
                }
                name="error-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <ErrorOutlineIcon //#REF map ErrorIcon
              fontSize="inherit"
              color={showColors ? 'error' : undefined}
            />
          ),
          label: statusCondition,
        };
      case DeployedRangeConsoleStatusEnum.NotReady:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <HourglassBottomIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <HourglassBottomIcon
                    fontSize="inherit"
                    color={showColors ? 'info' : undefined}
                  />
                }
                name="error-status-icon"
                message={statusMessage || 'Not Ready'}
              />
            ),
            label: 'Not Ready',
          };
        }
        return {
          icon: (
            <PauseCircleIcon //#REF map HourglassBottomIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: 'Not Ready',
        };
      case DeployedRangeConsoleStatusEnum.Stopped:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <DangerousIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <DangerousIcon
                    fontSize="inherit"
                    color={showColors ? 'disabled' : undefined}
                  />
                }
                name="info-status-icon"
                message={statusMessage || 'Paused'}
              />
            ),
            label: 'Paused',
          };
        }
        return {
          icon: (
            <DangerousIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: 'Paused',
        };
      default:
        return {
          icon: (
            <QuestionMarkIcon
              fontSize="inherit"
              color={showColors ? 'warning' : undefined}
            />
          ),
          label: statusCondition,
        };
    }
  }
  return {
    icon: (
      <QuestionMarkIcon
        fontSize="inherit"
        color={showColors ? 'warning' : undefined}
      />
    ),
    label: 'Unknown',
  };
};

/**
 * Icon for Displaying Container Status
 * @param {string | undefined} statusCondition Status
 * @param {string} [statusMessage] Message
 * @param {boolean} [showColors] Whether to inject color property based on status
 * @param {boolean} [showHover] Whether to display button with alert field for status message / status
 * @returns {} {icon: JSX.Element, label: string}
 */
export const getContainerStatusIcon = (
  statusCondition: string | undefined,
  statusMessage?: string,
  showColors?: boolean,
  showHover?: boolean,
) => {
  if (statusCondition) {
    switch (statusCondition) {
      case RangeContainerStatusEnum.Creating:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <AutorenewIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <AutorenewIcon
                    fontSize="inherit"
                    color={showColors ? 'info' : undefined}
                  />
                }
                name="warning-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <AutorenewIcon //#REF map: HourglassBottmIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: statusCondition,
        };
      case RangeContainerStatusEnum.Deleting:
        return {
          icon: deletingIcon,
          label: statusCondition,
        };
      case RangeContainerStatusEnum.Ready:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: doneIcon, severity: 'success' }}
                boxProps={boxProps}
                infoIcon={
                  <CheckCircleIcon
                    fontSize="inherit"
                    color={showColors ? 'success' : undefined}
                  />
                }
                name="success-status-icon"
                message={statusMessage || 'Running'}
              />
            ),
            label: 'Running',
          };
        }
        return {
          icon: (
            <CheckCircleIcon
              fontSize="inherit"
              color={showColors ? 'success' : undefined}
            />
          ),
          label: 'Running',
        };
      case RangeContainerStatusEnum.Error:
        // special case (per BE) that container is in process of resuming or pausing
        if (statusMessage === 'Reconcile started') {
          if (showHover) {
            return {
              icon: (
                <ButtonInfoField
                  alertProps={{
                    icon: <HourglassBottomIcon />,
                    severity: 'info',
                  }}
                  boxProps={boxProps}
                  infoIcon={
                    <HourglassBottomIcon
                      fontSize="inherit"
                      color={showColors ? 'info' : undefined}
                    />
                  }
                  name="info-status-icon"
                  message={statusMessage}
                />
              ),
              label: 'Reconcile started',
            };
          }
          return {
            icon: (
              <HourglassBottomIcon
                fontSize="inherit"
                color={showColors ? 'info' : undefined}
              />
            ),
            label: 'Reconcile started',
          };
        }
        // special case (per BE) that container is in process of resuming or pausing
        if (statusMessage?.startsWith('Pod ')) {
          if (showHover) {
            return {
              icon: (
                <ButtonInfoField
                  alertProps={{
                    icon: <HourglassBottomIcon />,
                    severity: 'info',
                  }}
                  boxProps={boxProps}
                  infoIcon={
                    <HourglassBottomIcon
                      fontSize="inherit"
                      color={showColors ? 'info' : undefined}
                    />
                  }
                  name="info-status-icon"
                  message={statusMessage}
                />
              ),
              label: 'Pod not ready',
            };
          }
          return {
            icon: (
              <HourglassBottomIcon
                fontSize="inherit"
                color={showColors ? 'info' : undefined}
              />
            ),
            label: 'Pod not ready',
          };
        }
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: errorIcon, severity: 'error' }}
                boxProps={boxProps}
                infoIcon={
                  <ErrorOutlineIcon
                    fontSize="inherit"
                    color={showColors ? 'error' : undefined}
                  />
                }
                name="error-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <ErrorOutlineIcon //#REF map ErrorIcon
              fontSize="inherit"
              color={showColors ? 'error' : undefined}
            />
          ),
          label: statusCondition,
        };
      case RangeContainerStatusEnum.NotReady:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <HourglassBottomIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <HourglassBottomIcon
                    fontSize="inherit"
                    color={showColors ? 'info' : undefined}
                  />
                }
                name="error-status-icon"
                message={statusMessage || 'Not Ready'}
              />
            ),
            label: 'Not Ready',
          };
        }
        return {
          icon: (
            <PauseCircleIcon //#REF map HourglassBottomIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: 'Not Ready',
        };
      case RangeContainerStatusEnum.Stopped:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <DangerousIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <DangerousIcon
                    fontSize="inherit"
                    color={showColors ? 'disabled' : undefined}
                  />
                }
                name="info-status-icon"
                message={statusMessage || 'Paused'}
              />
            ),
            label: 'Paused',
          };
        }
        return {
          icon: (
            <DangerousIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: 'Paused',
        };
      default:
        return {
          icon: (
            <QuestionMarkIcon
              fontSize="inherit"
              color={showColors ? 'warning' : undefined}
            />
          ),
          label: statusCondition,
        };
    }
  }
  return {
    icon: (
      <QuestionMarkIcon
        fontSize="inherit"
        color={showColors ? 'warning' : undefined}
      />
    ),
    label: 'Unknown',
  };
};

/**
 * Icon for Displaying Ghost Machine Status
 * @param {GhostMachineStatusEnum | undefined} statusCondition Status
 * @param {GhostMachineStatusUpEnum | undefined} machineStatusCondition Status
 * @param {string} [statusMessage] Message
 * @param {boolean} [showColors] Whether to inject color property based on status
 * @param {boolean} [showHover] Whether to display button with alert field for status message / status
 * @returns {} {icon: JSX.Element, label: string}
 */
export const getGhostMachineStatusIcon = (
  statusCondition: GhostMachineStatusEnum | undefined,
  machineStatusCondition: GhostMachineStatusUpEnum | undefined,
  statusMessage?: string,
  showColors?: boolean,
  showHover?: boolean,
) => {
  // the statusCondition has more detailed information available than the machineStatusCondition
  if (statusCondition) {
    switch (statusCondition) {
      case GhostMachineStatusEnum.Creating:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <AutorenewIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <AutorenewIcon
                    fontSize="inherit"
                    color={showColors ? 'disabled' : undefined}
                  />
                }
                name="warning-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <AutorenewIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: statusCondition,
        };
      case GhostMachineStatusEnum.Deleting:
      case GhostMachineStatusEnum.Deleted:
        return {
          icon: deletingIcon,
          label: statusCondition,
        };
      case GhostMachineStatusEnum.Active:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{
                  icon: <DirectionsRunIcon />,
                  severity: 'success',
                }}
                boxProps={boxProps}
                infoIcon={
                  <DirectionsRunIcon
                    fontSize="inherit"
                    color={showColors ? 'success' : undefined}
                  />
                }
                name="success-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <DirectionsRunIcon
              fontSize="inherit"
              color={showColors ? 'success' : undefined}
            />
          ),
          label: statusCondition,
        };
      case GhostMachineStatusEnum.Ready:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: doneIcon, severity: 'success' }}
                boxProps={boxProps}
                infoIcon={
                  <CheckCircleIcon
                    fontSize="inherit"
                    color={showColors ? 'success' : undefined}
                  />
                }
                name="success-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <CheckCircleIcon
              fontSize="inherit"
              color={showColors ? 'success' : undefined}
            />
          ),
          label: statusCondition,
        };
      case GhostMachineStatusEnum.NotReady:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <HourglassBottomIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <HourglassBottomIcon
                    fontSize="inherit"
                    color={showColors ? 'info' : undefined}
                  />
                }
                name="not-ready-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <HourglassBottomIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: statusCondition,
        };

      case GhostMachineStatusEnum.Stopped:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <DangerousIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <DangerousIcon
                    fontSize="inherit"
                    color={showColors ? 'disabled' : undefined}
                  />
                }
                name="down-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <DangerousIcon
              fontSize="inherit"
              color={showColors ? 'disabled' : undefined}
            />
          ),
          label: statusCondition,
        };
      case GhostMachineStatusEnum.Error:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: errorIcon, severity: 'error' }}
                boxProps={boxProps}
                infoIcon={
                  <ErrorOutlineIcon
                    fontSize="inherit"
                    color={showColors ? 'error' : undefined}
                  />
                }
                name="error-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <ErrorOutlineIcon
              fontSize="inherit"
              color={showColors ? 'error' : undefined}
            />
          ),
          label: statusCondition,
        };
    }
  } else if (machineStatusCondition) {
    switch (machineStatusCondition) {
      case GhostMachineStatusUpEnum.Down:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <DangerousIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <DangerousIcon
                    fontSize="inherit"
                    color={showColors ? 'disabled' : undefined}
                  />
                }
                name="down-status-icon"
                message={statusMessage || machineStatusCondition}
              />
            ),
            label: machineStatusCondition,
          };
        }
        return {
          icon: (
            <DangerousIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: machineStatusCondition,
        };
      case GhostMachineStatusUpEnum.Up:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{
                  icon: <DirectionsRunIcon />,
                  severity: 'success',
                }}
                boxProps={boxProps}
                infoIcon={
                  <DirectionsRunIcon
                    fontSize="inherit"
                    color={showColors ? 'success' : undefined}
                  />
                }
                name="success-status-icon"
                message={statusMessage || machineStatusCondition}
              />
            ),
            label: machineStatusCondition,
          };
        }
        return {
          icon: (
            <DirectionsRunIcon
              fontSize="inherit"
              color={showColors ? 'success' : undefined}
            />
          ),
          label: machineStatusCondition,
        };
      case GhostMachineStatusUpEnum.UpWithErrors:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: errorIcon, severity: 'error' }}
                boxProps={boxProps}
                infoIcon={
                  <ErrorOutlineIcon
                    fontSize="inherit"
                    color={showColors ? 'error' : undefined}
                  />
                }
                name="error-status-icon"
                message={statusMessage || 'Up With Errors'}
              />
            ),
            label: 'Up With Errors',
          };
        }
        return {
          icon: (
            <ErrorOutlineIcon //#REF map ErrorIcon
              fontSize="inherit"
              color={showColors ? 'error' : undefined}
            />
          ),
          label: 'Up With Errors',
        };
      case GhostMachineStatusUpEnum.DownWithErrors:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: errorIcon, severity: 'error' }}
                boxProps={boxProps}
                infoIcon={
                  <ErrorOutlineIcon
                    fontSize="inherit"
                    color={showColors ? 'error' : undefined}
                  />
                }
                name="error-status-icon"
                message={statusMessage || 'Down With Errors'}
              />
            ),
            label: 'Down With Errors',
          };
        }
        return {
          icon: (
            <ErrorOutlineIcon //#REF map ErrorIcon
              fontSize="inherit"
              color={showColors ? 'error' : undefined}
            />
          ),
          label: 'Down With Errors',
        };
      default:
        return {
          icon: (
            <QuestionMarkIcon
              fontSize="inherit"
              color={showColors ? 'warning' : undefined}
            />
          ),
          label: machineStatusCondition,
        };
    }
  }
  return {
    icon: (
      <QuestionMarkIcon
        fontSize="inherit"
        color={showColors ? 'warning' : undefined}
      />
    ),
    label: statusCondition ?? 'Unknown',
  };
};

/**
 * Icon for Displaying Package Status
 * @param {string | undefined} statusCondition Status
 * @param {string} [statusMessage] Message
 * @param {boolean} [showColors] Whether to inject color property based on status
 * @param {boolean} [showHover] Whether to display button with alert field for status message / status
 * @returns {} {icon: JSX.Element, label: string}
 */
export const getPackageStatusIcon = (
  statusCondition: string | undefined,
  statusMessage?: string,
  showColors?: boolean,
  showHover?: boolean,
) => {
  if (statusCondition) {
    switch (statusCondition) {
      case DeployedPackageDetailStatusEnum.Creating:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <AutorenewIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <AutorenewIcon
                    fontSize="inherit"
                    color={showColors ? 'info' : undefined}
                  />
                }
                name="info-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <AutorenewIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: statusCondition,
        };
      case DeployedPackageDetailStatusEnum.Deleting:
        return {
          icon: deletingIcon,
          label: statusCondition,
        };
      case DeployedPackageDetailStatusEnum.Ready:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <DoneIcon />, severity: 'success' }}
                boxProps={boxProps}
                infoIcon={
                  <CheckCircleIcon
                    fontSize="inherit"
                    color={showColors ? 'success' : undefined}
                  />
                }
                name="success-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <DoneIcon
              fontSize="inherit"
              color={showColors ? 'success' : undefined}
            />
          ),
          label: statusCondition,
        };
      case DeployedPackageDetailStatusEnum.Error:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: errorIcon, severity: 'error' }}
                boxProps={boxProps}
                infoIcon={
                  <ErrorOutlineIcon
                    fontSize="inherit"
                    color={showColors ? 'error' : undefined}
                  />
                }
                name="error-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <ErrorOutlineIcon
              fontSize="inherit"
              color={showColors ? 'error' : undefined}
            />
          ),
          label: statusCondition,
        };
      case DeployedPackageDetailStatusEnum.NotReady:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <HourglassBottomIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <HourglassBottomIcon
                    fontSize="inherit"
                    color={showColors ? 'info' : undefined}
                  />
                }
                name="info-status-icon"
                message={statusMessage || 'Not Ready'}
              />
            ),
            label: 'Not Ready',
          };
        }
        return {
          icon: (
            <HourglassBottomIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: 'Not Ready',
        };

      default:
        return {
          icon: (
            <QuestionMarkIcon
              fontSize="inherit"
              color={showColors ? 'warning' : undefined}
            />
          ),
          label: 'Unknown',
        };
    }
  }
  return {
    icon: (
      <QuestionMarkIcon
        fontSize="inherit"
        color={showColors ? 'warning' : undefined}
      />
    ),
    label: 'Unknown',
  };
};

/**
 * Icon for Displaying Range Status
 * @param {string | undefined} statusCondition Status
 * @param {string} [statusMessage] Message
 * @param {boolean} [showColors] Whether to inject color property based on status
 * @param {boolean} [showHover] Whether to display button with alert field for status message / status
 * @returns {} {icon: JSX.Element, label: string}
 */
export const getRangeStatusIcon = (
  statusCondition: string | undefined,
  statusMessage?: string,
  showColors?: boolean,
  showHover?: boolean,
) => {
  if (statusCondition) {
    switch (statusCondition) {
      case RangeStatusEnum.Creating:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <AutorenewIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <AutorenewIcon
                    fontSize="inherit"
                    color={showColors ? 'info' : undefined}
                  />
                }
                name="info-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <AutorenewIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: statusCondition,
        };
      case RangeStatusEnum.Deleting:
        return {
          icon: deletingIcon,
          label: statusCondition,
        };
      case RangeStatusEnum.Ready:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <DoneIcon />, severity: 'success' }}
                boxProps={boxProps}
                infoIcon={
                  <CheckCircleIcon
                    fontSize="inherit"
                    color={showColors ? 'success' : undefined}
                  />
                }
                name="success-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <DoneIcon
              fontSize="inherit"
              color={showColors ? 'success' : undefined}
            />
          ),
          label: statusCondition,
        };
      case RangeStatusEnum.Error:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: errorIcon, severity: 'error' }}
                boxProps={boxProps}
                infoIcon={
                  <ErrorOutlineIcon
                    fontSize="inherit"
                    color={showColors ? 'error' : undefined}
                  />
                }
                name="error-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <ErrorOutlineIcon
              fontSize="inherit"
              color={showColors ? 'error' : undefined}
            />
          ),
          label: statusCondition,
        };
      case RangeStatusEnum.NotReady:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <HourglassBottomIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <HourglassBottomIcon
                    fontSize="inherit"
                    color={showColors ? 'info' : undefined}
                  />
                }
                name="info-status-icon"
                message={statusMessage || 'Not Ready'}
              />
            ),
            label: 'Not Ready',
          };
        }
        return {
          icon: (
            <HourglassBottomIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: 'Not Ready',
        };
      case RangeStatusEnum.Stopped:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <DangerousIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <DangerousIcon
                    fontSize="inherit"
                    color={showColors ? 'disabled' : undefined}
                  />
                }
                name="info-status-icon"
                message={statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <DangerousIcon
              color={showColors ? 'disabled' : undefined}
              fontSize="inherit"
            />
          ),
          label: statusCondition,
        };
      default:
        return {
          icon: (
            <QuestionMarkIcon
              fontSize="inherit"
              color={showColors ? 'warning' : undefined}
            />
          ),
          label: 'Unknown',
        };
    }
  }
  return {
    icon: (
      <QuestionMarkIcon
        fontSize="inherit"
        color={showColors ? 'warning' : undefined}
      />
    ),
    label: 'Unknown',
  };
};

/**
 * Icon for Displaying Scenario Status
 * @param {string | undefined} statusCondition Status
 * @param {string} [statusMessage] Message
 * @param {boolean} [showColors] Whether to inject color property based on status
 * @param {boolean} [showHover] Whether to display button with alert field for status message / status
 * @returns {} {icon: JSX.Element, label: string}
 */
export const getScenarioStatusIcon = (
  statusCondition: string | undefined,
  statusMessage?: string,
  showColors?: boolean,
  showHover?: boolean,
) => {
  if (statusCondition) {
    switch (statusCondition) {
      case DeployedScenarioDetailStatusEnum.Creating:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <AutorenewIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <AutorenewIcon
                    fontSize="inherit"
                    color={showColors ? 'info' : undefined}
                  />
                }
                name="info-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <AutorenewIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: statusCondition,
        };
      case DeployedScenarioDetailStatusEnum.Deleting:
        return {
          icon: deletingIcon,
          label: statusCondition,
        };
      case DeployedScenarioDetailStatusEnum.Ready:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <DoneIcon />, severity: 'success' }}
                boxProps={boxProps}
                infoIcon={
                  <CheckCircleIcon
                    fontSize="inherit"
                    color={showColors ? 'success' : undefined}
                  />
                }
                name="success-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <DoneIcon
              fontSize="inherit"
              color={showColors ? 'success' : undefined}
            />
          ),
          label: statusCondition,
        };
      case DeployedScenarioDetailStatusEnum.Error:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: errorIcon, severity: 'error' }}
                boxProps={boxProps}
                infoIcon={
                  <ErrorOutlineIcon
                    fontSize="inherit"
                    color={showColors ? 'error' : undefined}
                  />
                }
                name="error-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <ErrorOutlineIcon
              fontSize="inherit"
              color={showColors ? 'error' : undefined}
            />
          ),
          label: statusCondition,
        };
      case DeployedPackageDetailStatusEnum.NotReady:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <HourglassBottomIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <HourglassBottomIcon
                    fontSize="inherit"
                    color={showColors ? 'info' : undefined}
                  />
                }
                name="info-status-icon"
                message={statusMessage || 'Not Ready'}
              />
            ),
            label: 'Not Ready',
          };
        }
        return {
          icon: (
            <HourglassBottomIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: 'Not Ready',
        };
      case DeployedPackageDetailStatusEnum.Stopped:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <DangerousIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <DangerousIcon
                    fontSize="inherit"
                    color={showColors ? 'disabled' : undefined}
                  />
                }
                name="info-status-icon"
                message={statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <DangerousIcon
              color={showColors ? 'disabled' : undefined}
              fontSize="inherit"
            />
          ),
          label: statusCondition,
        };
      default:
        return {
          icon: (
            <QuestionMarkIcon
              fontSize="inherit"
              color={showColors ? 'warning' : undefined}
            />
          ),
          label: 'Unknown',
        };
    }
  }
  return {
    icon: (
      <QuestionMarkIcon
        fontSize="inherit"
        color={showColors ? 'warning' : undefined}
      />
    ),
    label: 'Unknown',
  };
};

/**
 * Icon for Displaying VM Status
 * @param {string | undefined} statusCondition kubernetes status for VM
 * @param {string} [statusMessage] Message
 * @param {string} [altStatusCondition] status for VM
 * @param {boolean} [showColors] Whether to inject color property based on status
 * @param {boolean} [showHover] Whether to display button with alert field for status message / status
 * @returns {} {icon: JSX.Element, label: string}
 */
export const getVmStatusIcon = (
  statusCondition: string | undefined,
  statusMessage?: string,
  altStatus?: string,
  showColors?: boolean,
  showHover?: boolean,
) => {
  // special case - when vm is being deleted, the kubernetes status is not updated to terminating, but status is set to deleting
  if (altStatus && altStatus === RangeVMStatusEnum.Deleting) {
    return getRangeResourceStatus(
      altStatus,
      statusMessage,
      false,
      showColors,
      showHover,
    );
  }
  if (statusCondition) {
    switch (statusCondition) {
      case RangeVMKubevirtVmStatusEnum.Provisioning:
      case RangeVMKubevirtVmStatusEnum.Migrating:
      case RangeVMKubevirtVmStatusEnum.Starting:
      case RangeVMKubevirtVmStatusEnum.Stopping:
      case RangeVMKubevirtVmStatusEnum.WaitingForVolumeBinding:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <AutorenewIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <AutorenewIcon
                    fontSize="inherit"
                    color={showColors ? 'info' : undefined}
                  />
                }
                name="info-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <AutorenewIcon //#REF map HourglassBottomIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: statusCondition,
        };
      case RangeVMKubevirtVmStatusEnum.Terminating:
        return {
          icon: deletingIcon,
          label: statusCondition,
        };
      case RangeVMKubevirtVmStatusEnum.Running:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: doneIcon, severity: 'success' }}
                boxProps={boxProps}
                infoIcon={
                  <CheckCircleIcon
                    fontSize="inherit"
                    color={showColors ? 'success' : undefined}
                  />
                }
                name="success-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <CheckCircleIcon
              fontSize="inherit"
              color={showColors ? 'success' : undefined}
            />
          ),
          label: statusCondition,
        };
      case RangeVMKubevirtVmStatusEnum.ErrorUnschedulable:
        // Special case per BE - this is a "healthy state" as VM is waiting...
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <HourglassBottomIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <HourglassBottomIcon
                    fontSize="inherit"
                    color={showColors ? 'info' : undefined}
                  />
                }
                name="info-status-icon"
                message="Waiting for Compute Allocation"
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <HourglassBottomIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: 'Waiting for Compute Allocation',
        };
      case RangeVMKubevirtVmStatusEnum.DataVolumeError:
      case RangeVMKubevirtVmStatusEnum.ErrImagePull:
      case RangeVMKubevirtVmStatusEnum.ErrorPvcNotFound:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: errorIcon, severity: 'error' }}
                boxProps={boxProps}
                infoIcon={
                  <ErrorOutlineIcon
                    fontSize="inherit"
                    color={showColors ? 'error' : undefined}
                  />
                }
                name="error-status-icon"
                message={statusMessage || 'Error'}
              />
            ),
            label: 'Error',
          };
        }
        return {
          icon: (
            <ErrorOutlineIcon //#REF map ErrorIcon
              fontSize="inherit"
              color={showColors ? 'error' : undefined}
            />
          ),
          label: statusCondition,
        };
      case RangeVMKubevirtVmStatusEnum.Paused:
      case RangeVMKubevirtVmStatusEnum.Stopped:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <DangerousIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <DangerousIcon
                    fontSize="inherit"
                    color={showColors ? 'disabled' : undefined}
                  />
                }
                name="info-status-icon"
                message={'Stopped'}
              />
            ),
            label: 'Stopped',
          };
        }
        return {
          icon: (
            <DangerousIcon
              color={showColors ? 'disabled' : undefined}
              fontSize="inherit"
            />
          ),
          label: statusCondition,
        };
      case RangeVMKubevirtVmStatusEnum.CrashLoopBackoff:
      case RangeVMKubevirtVmStatusEnum.ImagePullBackoff:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <QuestionMarkIcon />, severity: 'warning' }}
                boxProps={boxProps}
                infoIcon={
                  <QuestionMarkIcon
                    fontSize="inherit"
                    color={showColors ? 'warning' : undefined}
                  />
                }
                name="warning-status-icon"
                message={statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <QuestionMarkIcon
              fontSize="inherit"
              color={showColors ? 'warning' : undefined}
            />
          ),
          label: statusCondition,
        };
      default:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <QuestionMarkIcon />, severity: 'warning' }}
                boxProps={boxProps}
                infoIcon={
                  <QuestionMarkIcon
                    fontSize="inherit"
                    color={showColors ? 'warning' : undefined}
                  />
                }
                name="warning-status-icon"
                message={statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <QuestionMarkIcon
              fontSize="inherit"
              color={showColors ? 'warning' : undefined}
            />
          ),
          label: statusCondition,
        };
    }
  }
  // special case when first deploying a VM - the status isn't set yet
  if (statusCondition === '') {
    if (showHover) {
      return {
        icon: (
          <ButtonInfoField
            alertProps={{ icon: <HourglassBottomIcon />, severity: 'info' }}
            boxProps={boxProps}
            infoIcon={
              <HourglassBottomIcon
                fontSize="inherit"
                color={showColors ? 'info' : undefined}
              />
            }
            name="info-status-icon"
            message={'Not Ready'}
          />
        ),
        label: 'Not Ready',
      };
    }
    return {
      icon: (
        <HourglassBottomIcon
          fontSize="inherit"
          color={showColors ? 'info' : undefined}
        />
      ),
      label: 'Not Ready',
    };
  }
  return {
    icon: (
      <QuestionMarkIcon
        fontSize="inherit"
        color={showColors ? 'warning' : undefined}
      />
    ),
    label: 'Unknown',
  };
};

/**
 * Returns status icon and label elements
 * Icon changes based on statusCondition
 * Label displays statusCondition
 * Elements have a tooltip that displays statusMessage if statusCondition is an error state
 * used for resources which do NOT have an enum for their status field
 * @param {string} statusCondition status
 * @param {string} [statusMessage] message that provides detail
 * @param {boolean} [showColors] Whether to inject color property based on status
 * @param {boolean} [showHover] Whether to display button with alert field for status message / status
 * @return {JSX.Element} Render elements
 */
export const getRangeResourceStatus = (
  statusCondition: string,
  statusMessage?: string,
  ready?: boolean,
  showColors?: boolean,
  showHover?: boolean,
) => {
  if (ready) {
    return {
      icon: (
        <DoneIcon fontSize="inherit" color={showColors ? 'info' : undefined} />
      ),
      label: 'Ready',
    };
  }
  if (statusCondition) {
    switch (statusCondition.toLowerCase()) {
      case 'reconcilerequeue':
        if (statusMessage || showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <ReplayIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <ReplayIcon
                    fontSize="inherit"
                    color={showColors ? 'info' : undefined}
                  />
                }
                name="info-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: statusCondition,
          };
        }
        return {
          icon: (
            <ReplayIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: 'Reconcile Requeue',
        };
      case 'ready':
      case 'reconcilesuccess':
      case 'reconcile success': //TMP? until Range Volume status fixed - has space in status
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: doneIcon, severity: 'success' }}
                boxProps={boxProps}
                infoIcon={
                  <DoneIcon
                    fontSize="inherit"
                    color={showColors ? 'success' : undefined}
                  />
                }
                name="success-status-icon"
                message={statusMessage || 'Ready'}
              />
            ),
            label: 'Ready',
          };
        }
        return {
          icon: (
            <DoneIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: 'Ready',
        };
      case 'notready':
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <HourglassBottomIcon />, severity: 'info' }}
                boxProps={boxProps}
                infoIcon={
                  <HourglassBottomIcon
                    fontSize="inherit"
                    color={showColors ? 'info' : undefined}
                  />
                }
                name="info-status-icon"
                message={statusMessage || 'Not Ready'}
              />
            ),
            label: 'Not Ready',
          };
        }
        return {
          icon: (
            <HourglassBottomIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: 'Not Ready',
        };
      case 'failed':
      case 'jobfailed':
        if (statusMessage || showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: errorIcon, severity: 'error' }}
                boxProps={boxProps}
                infoIcon={
                  <ErrorOutlineIcon
                    fontSize="inherit"
                    color={showColors ? 'error' : undefined}
                  />
                }
                name="error-status-icon"
                message={statusMessage || 'Error'}
              />
            ),
            label: 'Error',
          };
        }
        return {
          icon: (
            <ErrorOutlineIcon
              fontSize="inherit"
              color={showColors ? 'error' : undefined}
            />
          ),
          label: 'Error',
        };
      case 'deleting':
        return {
          icon: deletingIcon,
          label: statusCondition,
        };
      default:
        if (showHover) {
          return {
            icon: (
              <ButtonInfoField
                alertProps={{ icon: <HourglassBottomIcon />, severity: 'info' }}
                boxProps={{ width: '24px', height: '24px' }}
                infoIcon={
                  <HourglassBottomIcon fontSize="inherit" color="info" />
                }
                name="not-ready-status-icon"
                message={statusMessage || statusCondition}
              />
            ),
            label: 'Not Ready',
          };
        }
        return {
          icon: (
            <HourglassBottomIcon
              fontSize="inherit"
              color={showColors ? 'info' : undefined}
            />
          ),
          label: 'Not Ready',
        };
    }
  }
  return {
    icon: (
      <HourglassBottomIcon
        fontSize="inherit"
        color={showColors ? 'info' : undefined}
      />
    ),
    label: 'Not Ready',
  };
};

/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */

/* CCMI5 Flavor */
import { useContext, useEffect, useMemo } from 'react';



/* MUI */
import ListItemIcon from '@mui/material/ListItemIcon';
import { DeployedRangeConsole, RangeContainerStatusEnum } from '@rangeos-nx/frontend/clients/devops-api';
import { getContainerStatusIcon } from '@rangeos-nx/frontend/clients/hooks';
import { listStyles, OverflowTypography, actionRowHeaderColor } from '@rapid-cmi5/ui';
import ConsoleList from '../../scenario/console/ConsoleList';
import { getVmImageIcon } from '../../scenario/icons/iconConstants';



// widths so name doesn't run into consoles if they exist
const nameFieldDefaultWidth = '90%';
const nameFieldWithConsolesWidth = '75%';

/**
 * Props for TeamRangeResourceContainerActionRow
 * @type Props
 * @property {number} counter Counter increments when graph data updates
 * @property {number} consoleCounter Counter increments when console data updates
 * @property {any} [data] Data for this deployed VM
 * @property {{(deployedScenarioId: string,ownerUuid: string) => Partial<DeployedRangeConsole>[]}} getConsolesByOwner Method to retrieve consoles
 * @property {boolean} [isTitleDisplay = false] Whether row contains column headers
 * @property {string} [primaryRowTitle='Name'] Header to show for name field
 * @property {boolean} [isTitleDisplay = false] Whether this row is the column header row
 * @property {string} rangeId Range uuid
 * @property {string} scenarioId Range uuid
 * @property {() => void} [onActionSelect] Method to notify when an action selected in row
 */
type Props = {
  counter: number;
  consoleCounter: number;
  data?: any;
  getConsolesByOwner: (
    deployedScenarioId: string,
    ownerUuid: string,
  ) => Partial<DeployedRangeConsole>[];
  isTitleDisplay?: boolean;
  primaryRowTitle?: string;
  rangeId: string;
  scenarioId: string;
  onActionSelect?: () => void;
};

/**
 * Provides action row for a Deployed Container
 * @param {Props} props
 * @returns {React.ReactElement}
 */
export default function TeamRangeResourceContainerActionRow(props: Props) {
  const {
    counter,
    consoleCounter,
    data = '',
    getConsolesByOwner,
    isTitleDisplay = false,
    primaryRowTitle = 'Name',
    rangeId,
    scenarioId,
  } = props;

  const consoles = getConsolesByOwner(scenarioId, data?.uuid || '');
  const rowData = data;

  useEffect(() => {
    // rerender for status change
  }, [counter, consoleCounter]);

  const rowIcon = getVmImageIcon(rowData?.chartIcon || '', { color: 'grey' });
  const isDeleting = rowData.status === RangeContainerStatusEnum.Deleting;

  const getStatusChild = useMemo(() => {
    // don't want to display icon when Running
    if (rowData.status !== RangeContainerStatusEnum.Ready) {
      const rowStatus = getContainerStatusIcon(
        rowData.status,
        rowData.message,
        true, // show color
        true, // show hover
      );
      return (
        <ListItemIcon sx={{ marginLeft: '12px' }}>
          {rowStatus.icon}
        </ListItemIcon>
      );
    }
    return null;
  }, [rowData.status, rowData.message]);

  const nameFieldWidth =
    consoles.length === 0 ? nameFieldDefaultWidth : nameFieldWithConsolesWidth;

  // so console div will support console button width
  const minConsoleColumnWidth = consoles.length > 0 ? '125px' : '28px';

  return (
    <>
      {isTitleDisplay && (
        <div style={listStyles.shortRow}>
          <div style={listStyles.columnName}>
            {/* icon */}
            <OverflowTypography
              title={primaryRowTitle}
              variant="caption"
              color={actionRowHeaderColor}
            />
          </div>
        </div>
      )}
      {/* don't show Containers if they are currently being deleted (terminating) */}
      {!isTitleDisplay && rowData && !isDeleting && (
        <div style={listStyles.row}>
          <div
            style={{
              ...listStyles.columnName,
              maxHeight: 'fit-content',
            }}
          >
            {rowIcon}
            {/* auto keeps status next to name and from running into consoles if they exist*/}
            <div style={{ width: 'auto', maxWidth: nameFieldWidth }}>
              <OverflowTypography
                uuid={rowData.uuid}
                title={rowData.name}
                sxProps={{
                  paddingLeft: '8px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              />
            </div>
            {getStatusChild}

            <div
              style={{
                ...listStyles.sm,
                maxHeight: 'fit-content',
                flexWrap: 'wrap',
                minWidth: minConsoleColumnWidth,
                marginBottom: '4px', //not sure why buttons dont align
              }}
            >
              <ConsoleList consoles={consoles} overrideRangeId={rangeId} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

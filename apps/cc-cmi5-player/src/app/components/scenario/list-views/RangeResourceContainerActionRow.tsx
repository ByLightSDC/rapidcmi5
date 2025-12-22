/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */

/* CCMI5 Flavor */
import { useContext, useEffect, useMemo } from 'react';

/* Branded */
import {
  getVmImageIcon,
  listStyles,
  OverflowTypography,
  actionRowHeaderColor,
  ConsoleList,
} from '@rapid-cmi5/ui';

/* MUI */
import ListItemIcon from '@mui/material/ListItemIcon';

/* Topic */
import { ScenarioUpdatesContext } from '../ScenarioUpdatesContext';

/* Constants */
import { RangeContainerStatusEnum } from '@rapid-cmi5/ui';
import { getContainerStatusIcon } from '@rapid-cmi5/ui';

// widths so name doesn't run into consoles if they exist
const nameFieldDefaultWidth = '90%';
const nameFieldWithConsolesWidth = '75%';

/**
 * Props for RangeResourceContainerActionRow
 * @type Props
 * @property {any} [data] Data for this deployed Container
 * @property {boolean} [isSelected = false] Whether this row is selected
 * @property {boolean} [isTitleDisplay = false] Whether row contains column headers
 * @property {string} [primaryRowTitle='Name'] Header to show for name field
 * @property {boolean} [showMultiSelectedStyles] Whether to show selected state styles in the context of multiselection, Ex. checkbox icon
 * @property {() => void} [onActionSelect] Method to notify when an action selected in row
 * @property {(data: any, shiftKeyOn?: boolean) => void} [onRowSelect] Method to handle selection of row
 */
type Props = {
  data?: any;
  isTitleDisplay?: boolean;
  primaryRowTitle?: string;
  onActionSelect?: () => void;
};

/**
 * Provides action row for a Deployed Container
 * @param {Props} props
 * @returns {React.ReactElement}
 */
export default function RangeResourceContainerActionRow(props: Props) {
  const { data = '', isTitleDisplay = false, primaryRowTitle = 'Name' } = props;

  const {
    consoleStatusChangeCounter,
    getConsolesByOwner,
    containerStatusChangeCounter,
  } = useContext(ScenarioUpdatesContext);

  //   const vmData = getUpdate(data?.uuid || '') || data;
  const consoles = getConsolesByOwner(data?.uuid || '');
  const rowData = data;

  useEffect(() => {
    // rerender for status change
  }, [consoleStatusChangeCounter, containerStatusChangeCounter]);

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
              <ConsoleList consoles={consoles} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
} from '@rangeos-nx/ui/branded';

/* MUI */
import ListItemIcon from '@mui/material/ListItemIcon';

/* Topic */
import { ScenarioUpdatesContext } from '../ScenarioUpdatesContext';

/* Constants */
import {
  RangeVMStatusEnum,
  RangeVMKubevirtVmStatusEnum,
} from '@rangeos-nx/frontend/clients/devops-api';
import { getVmStatusIcon } from '@rangeos-nx/ui/api/hooks';

// widths so name doesn't run into consoles if they exist
const nameFieldDefaultWidth = '90%';
const nameFieldWithConsolesWidth = '75%';

/**
 * Props for RangeResourceVMActionRow
 * @type Props
 * @property {any} [data] Data for this deployed VM
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
 * Provides action row for a Deployed VM
 * @param {Props} props
 * @returns {React.ReactElement}
 */
export default function RangeResourceVMActionRow(props: Props) {
  const { data = '', isTitleDisplay = false, primaryRowTitle = 'Name' } = props;

  const {
    consoleStatusChangeCounter,
    getConsolesByOwner,
    vmStatusChangeCounter,
  } = useContext(ScenarioUpdatesContext);

  const vmConsoles = getConsolesByOwner(data?.uuid || '');
  const vmData = data;

  useEffect(() => {
    // rerender for status change
  }, [consoleStatusChangeCounter, vmStatusChangeCounter]);

  const rowIcon = getVmImageIcon(
    vmData?.vmImage?.bootDetails?.meta?.iconType || '',
    { color: 'grey' },
  );

  const isDeleting = vmData.status === 'Deleting';

  const getStatusChild = useMemo(() => {
    // don't want to display icon when Running
    //  - kube status doesn't update immediately when deleting so need to check status as well
    if (
      vmData.kubevirtVmStatus !== RangeVMKubevirtVmStatusEnum.Running ||
      vmData.status === RangeVMStatusEnum.Deleting
    ) {
      const rowStatus = getVmStatusIcon(
        vmData.kubevirtVmStatus,
        vmData.kubevirtVmMessage,
        vmData.status,
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
  }, [vmData.kubevirtVmStatus, vmData.kubevirtVmMessage, vmData.status]);

  const nameFieldWidth =
    vmConsoles.length === 0
      ? nameFieldDefaultWidth
      : nameFieldWithConsolesWidth;

  // so console div will support console button width
  const minConsoleColumnWidth = vmConsoles.length > 0 ? '125px' : '28px';

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
      {/* don't show VMs if they are currently being deleted (terminating) */}
      {!isTitleDisplay && vmData && !isDeleting && (
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
                variant="body1"
                uuid={vmData.uuid}
                title={vmData.name}
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
              <ConsoleList consoles={vmConsoles} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

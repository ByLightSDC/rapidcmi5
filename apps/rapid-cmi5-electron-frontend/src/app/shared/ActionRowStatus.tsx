/* eslint-disable @typescript-eslint/no-explicit-any */

/* BRANDED */
import { OverflowTypography } from '@rapid-cmi5/ui/branded';

/* Branded */
import { listStyles } from '@rapid-cmi5/ui/branded';
/* MUI */
import ListItemIcon from '@mui/material/ListItemIcon';

/**
 * @typedef {Object} tComponentProps
 * @property {any} [data] Row data
 * @property {((
    status: string,
    message?: string,
    ready?: boolean,
    showColors?: boolean,
    showHover?: boolean
  ) => {
    icon: JSX.Element;
    label: string;
  }))} [getStatusChild] Method to retrieve icon and status label
 * @property {string} [title] Form title
 * @param {string} [uuid] UUID of data to populate the form
*/
type tComponentProps = {
  data: any;
  getStatusChild: (
    status: string,
    message?: string,
    ready?: boolean,
    showColors?: boolean,
    showHover?: boolean,
  ) => {
    icon: JSX.Element;
    label: string;
  };
  showColors?: boolean;
  showHover?: boolean;
};

/**
 * Displays Status in List Item Rows
 * @param {tComponentProps} props Component props
 * @return {JSX.Element} Icon and Label elements
 */
export default function ActionRowStatus(props: tComponentProps) {
  const { data, getStatusChild, showColors = true, showHover = true } = props;
  const status = data.status;
  const rowStatus = getStatusChild(
    status,
    data.message,
    data.ready,
    showColors,
    showHover,
  );

  return (
    <div style={listStyles.sm}>
      <ListItemIcon>{rowStatus.icon}</ListItemIcon>
      <OverflowTypography
        title={rowStatus?.label || ''}
        sxProps={{ fontWeight: 'bold', textTransform: 'uppercase' }}
      />
    </div>
  );
}

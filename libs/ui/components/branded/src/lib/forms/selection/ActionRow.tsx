/*
 *   Copyright (c) 2023 - 2024 By Light Professional IT Services LLC
 *   All rights reserved.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';

/* BRANDED */
import {
  OverflowTypography,
  useDisplayDateFormatter,
  equalsNoCase,
  SortButton,
  defaultSortBy,
  defaultSortByOptions,
  defaultStatusSortBy,
  defaultStatusSortByOptions,
} from '@rapid-cmi5/ui/branded';

/* Branded */
import { listStyles } from '@rapid-cmi5/ui/branded';
/* MUI */
import ListItemIcon from '@mui/material/ListItemIcon';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

/* Icons */
import CheckIcon from '@mui/icons-material/Check';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

import { RowAction, RowStatus } from '../../types/actionRowTypes';
import Box from '@mui/material/Box';
import { ButtonIcon } from '../../utility/buttons';

export const actionRowHeaderColor = 'text.hint';
export const actionRowDateHeader = 'Created or Updated';

/**
 * Basic Action Row Column Sort Options
 */
export const actionRowSortableColumns = {
  name: { inputFilter: defaultSortBy, filterValue: defaultSortByOptions[3] }, //name
  author: { inputFilter: defaultSortBy, filterValue: defaultSortByOptions[0] }, // author
  date: { inputFilter: defaultSortBy, filterValue: defaultSortByOptions[2] }, // dateEdited
};
export const actionRowStatusSortableColumns = {
  name: {
    inputFilter: defaultStatusSortBy,
    filterValue: defaultStatusSortByOptions[3],
  }, //name
  author: {
    inputFilter: defaultStatusSortBy,
    filterValue: defaultStatusSortByOptions[0],
  }, // author
  date: {
    inputFilter: defaultStatusSortBy,
    filterValue: defaultStatusSortByOptions[2],
  }, // dateEdited
  status: {
    inputFilter: defaultStatusSortBy,
    filterValue: defaultStatusSortByOptions[4],
  }, // status
};

const unknownNameValue = 'Unknown';
/**
 * @typedef Props - action row props
 * @property {JSX.Element} [children] any children to display under row
 * @property {*} [data] Row data
 * @property {boolean} [isSelected = false] Whether this row is selected
 * @property {boolean} [isTitleDisplay = false] Whether this is the title row or not
 * @property {*} [titleSxProps] Style props to apply to title row
 * @property {RowAction[]} [rowActions] Row actions to show
 * @property {JSX.Element} [rowChildren] Any additional row columns to show
 * @property {JSX.Element} [rowChildrenTitle] Title row info for the additinal row columns
 * @property {JSX.Element} [rowIcon] Icon to show for row
 * @property {*} [sortableColumns] Optional column(s) with filter information to allow sort
 *   example: actionRowSortableColumns above (if these all apply)
 * @property {JSX.Element | null} [rowStatusChildren] Any additional status column to show
 * @property {string} [rowTitle] Title to show for row
 * @property {any} [rowTitleStyle=listStyles.columnName] Special style to apply to title field
 * @property {string} [linkName] Name to show for optional Link column
 * @property {JSX.Element} [linkIcon] Icon to show before link Name in link column
 * @property {RowStatus} [rowStatus] Status information for row
 * @property {string} [rowAuthor] Author of row item
 * @property {any} [rowAuthorStyle=listStyles.md] Special style to apply to author field
 * @property {string | null} [rowDate] Date to display
 * @property {boolean} [shouldPreventTooltipWrap]
 * @property {boolean} [showMultiSelectedStyles] Whether to show selected state styles in the context of multiselection, Ex. checkbox icon
 * @property {boolean} [showSingleSelectedStyles] Whether to show selected state styles in the context of single selection, Ex. checkmark  icon
 * @property {(buttonIndex: number) => void} [onActionSelect] Method to call when a row action button is clicked
 * @property {() => void} [onLinkSelect] Method to call when link column is clicked
 * @property {(data?: any, shiftKeyOn?: boolean) => void} [onRowSelect] Method to call when the row is clicked
 */
export type ActionRowProps = {
  children?: JSX.Element;
  data?: any;
  dataIdField?: string;
  sortableColumns?: any;
  labels?: any;
  isSelected?: boolean;
  isTitleDisplay?: boolean;
  minActionWidth?: string;
  titleSxProps?: any;
  rowActions?: RowAction[];
  rowChildren?: JSX.Element;
  rowChildrenTitle?: JSX.Element;
  rowIcon?: JSX.Element;
  rowStatusChildren?: JSX.Element | null;
  rowTitle?: string;
  rowTitleStyle?: any;
  linkName?: string;
  linkIcon?: JSX.Element;
  rowStatus?: RowStatus;
  rowAuthor?: string;
  rowAuthorStyle?: any;
  rowDate?: string | null;
  shouldPreventTooltipWrap?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
  showTitle?: boolean;
  showMultiSelectedStyles?: boolean;
  showSingleSelectedStyles?: boolean;
  onActionSelect?: (buttonIndex: number) => void;
  onLinkSelect?: () => void;
  onRowSelect?: (data?: any, shiftKeyOn?: boolean) => void;
};

/**
 * Resolves name from data
 * @param {*} data
 * @param {string} [dataIdField = 'uuid']
 * @returns string
 */
const getDefaultTitle = (data: any, dataIdField?: string) => {
  if (typeof data === 'string') {
    return data;
  }
  if (data.name) {
    return data.name;
  }
  const idField = dataIdField || 'uuid';

  if (Object.prototype.hasOwnProperty.call(data, idField)) {
    return data[idField];
  }
  return unknownNameValue;
};

/**
 * Dashboard Row with actions
 * @param {Props} props Props for action row
 * @returns
 */
export function ActionRow(props: ActionRowProps) {
  const {
    children,
    data = '',
    dataIdField = 'uuid',
    labels = { displayDateLabel: 'Created or Updated' },
    isSelected = false,
    isTitleDisplay = false,
    titleSxProps = {},
    rowChildren,
    rowChildrenTitle,
    rowIcon,
    rowTitle = getDefaultTitle(data, dataIdField),
    rowTitleStyle = listStyles.columnName,
    linkName,
    linkIcon,
    rowStatus,
    rowStatusChildren,
    rowAuthor = '',
    rowDate = '',
    rowActions = [],
    shouldPreventTooltipWrap,
    showAuthor = true,
    sortableColumns,
    rowAuthorStyle = listStyles.md,
    showDate = true,
    showTitle = true,
    showMultiSelectedStyles = false,
    showSingleSelectedStyles = false,
    onActionSelect,
    onLinkSelect,
    onRowSelect,
  } = props;

  // default minActionWidth based on number of actions if not provided as prop
  const minActionWidth = props.minActionWidth
    ? props.minActionWidth
    : rowActions
      ? rowActions.length === 1
        ? '45px' // so whole word "Actions" is shown
        : rowActions.length * 32 + 'px'
      : '0px';

  let resolvedId = '';
  if (Object.prototype.hasOwnProperty.call(data, dataIdField)) {
    resolvedId = data[dataIdField];
  }
  const { formatDisplayDateTime } = useDisplayDateFormatter();

  const handleRowClicked = (event: any) => {
    event.stopPropagation();
    if (onRowSelect) {
      // passing event.shifKey allows for multi-select
      onRowSelect(data, event.shiftKey);
    }
  };

  const displayAuthor = showAuthor ? rowAuthor || data?.author || ' ' : ''; //Empty char avoids missing Author title/row entry
  const displayDate = showDate
    ? rowDate || data?.dateEdited || data?.dateCreated || data?.created || ' '
    : ''; //Empty char avoids missing date title/row entry

  const isDeleting = useMemo(
    () => data?.status && equalsNoCase(data?.status, 'Deleting'),
    [data?.status],
  );

  return (
    <>
      {isTitleDisplay && (
        <div style={listStyles.shortRow}>
          {showTitle && (
            <div style={rowTitleStyle}>
              {/* icon */}
              {sortableColumns?.name ? (
                <SortButton
                  inputFilter={sortableColumns.name.inputFilter}
                  filterValue={sortableColumns.name.filterValue}
                  title={labels?.name || 'Name'}
                  variant="caption"
                  color={actionRowHeaderColor}
                />
              ) : (
                <OverflowTypography
                  title={labels?.name || 'Name'}
                  variant="caption"
                  color={actionRowHeaderColor}
                  sxProps={{ cursor: 'default' }}
                />
              )}
            </div>
          )}
          {linkName && (
            // click handler on the div traps mouse event to prevent firing click on the entire row
            <div style={{ ...listStyles.xs, ...listStyles.linkDiv }}>
              {/* icon */}
              <OverflowTypography
                title="Link"
                variant="caption"
                color={actionRowHeaderColor}
              />
            </div>
          )}
          {rowStatus && (
            <div style={listStyles.sm}>
              {/* icon */}
              <OverflowTypography
                title="Status"
                variant="caption"
                color={actionRowHeaderColor}
                sxProps={{ cursor: 'default' }}
              />
            </div>
          )}
          {rowStatusChildren && (
            <div style={listStyles.sm}>
              {/* icon */}
              {sortableColumns?.status ? (
                <SortButton
                  inputFilter={sortableColumns.status.inputFilter}
                  filterValue={sortableColumns.status.filterValue}
                  title={labels?.status || 'Status'}
                  variant="caption"
                  color={actionRowHeaderColor}
                />
              ) : (
                <OverflowTypography
                  title="Status"
                  variant="caption"
                  color={actionRowHeaderColor}
                  sxProps={{ cursor: 'default' }}
                />
              )}
            </div>
          )}
          {/* placeholder */}
          {rowChildrenTitle}
          {displayAuthor && (
            <div style={rowAuthorStyle}>
              {sortableColumns?.author ? (
                <SortButton
                  inputFilter={sortableColumns.author.inputFilter}
                  filterValue={sortableColumns.author.filterValue}
                  title={labels?.author || 'Author'}
                  variant="caption"
                  color={actionRowHeaderColor}
                />
              ) : (
                <OverflowTypography
                  title={labels?.author || 'Author'}
                  variant="caption"
                  color={actionRowHeaderColor}
                  sxProps={{ cursor: 'default' }}
                />
              )}
            </div>
          )}
          {displayDate && (
            <div style={listStyles.xs}>
              {sortableColumns?.date ? (
                <SortButton
                  inputFilter={sortableColumns.date.inputFilter}
                  filterValue={sortableColumns.date.filterValue}
                  title={labels?.displayDateLabel || actionRowDateHeader}
                  variant="caption"
                  color={actionRowHeaderColor}
                />
              ) : (
                <OverflowTypography
                  title={labels?.displayDateLabel || actionRowDateHeader}
                  variant="caption"
                  color={actionRowHeaderColor}
                  sxProps={{ cursor: 'default' }}
                />
              )}
            </div>
          )}
          {rowActions && rowActions?.length > 0 && (
            <div
              style={{
                ...listStyles.action,
                minWidth: minActionWidth,
              }}
            >
              <OverflowTypography
                title="Actions"
                variant="caption"
                color={actionRowHeaderColor}
                sxProps={{ cursor: 'default' }}
              />
            </div>
          )}
        </div>
      )}
      {!isTitleDisplay && (
        // disable interactions with row when deleting
        <Box
          sx={{
            ...listStyles.verticalRow,
            opacity: isDeleting ? 0.5 : 1,
            pointerEvents: !isDeleting ? 'auto' : 'none',
          }}
          onClick={handleRowClicked}
        >
          <div style={listStyles.row}>
            {showSingleSelectedStyles && isSelected && (
              <CheckIcon color="success" />
            )}

            {showMultiSelectedStyles && (
              <>
                {' '}
                {isSelected ? (
                  <CheckBoxIcon color="success" />
                ) : (
                  <CheckBoxOutlineBlankIcon color="success" />
                )}
              </>
            )}

            {showTitle && (
              <div style={rowTitleStyle}>
                {rowIcon && <ListItemIcon>{rowIcon}</ListItemIcon>}
                <OverflowTypography
                  uuid={resolvedId}
                  shouldPreventWrap={shouldPreventTooltipWrap}
                  title={rowTitle}
                  sxProps={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    ...titleSxProps,
                  }}
                />
              </div>
            )}

            {linkName && (
              // click handler on the div traps mouse event to prevent firing click on the entire row
              <div
                style={{ ...listStyles.xs, ...listStyles.linkDiv }}
                role="button"
                onClick={(event) => {
                  event?.stopPropagation();
                  if (onLinkSelect) {
                    onLinkSelect();
                  }
                }}
              >
                {linkIcon && <ListItemIcon>{linkIcon}</ListItemIcon>}
                <Typography
                  aria-label="View Link"
                  color="text.interactable"
                  className="clipped-text"
                  variant="body2"
                  sx={{
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                  }}
                >
                  <u>{linkName}</u>
                </Typography>
              </div>
            )}

            {rowStatus && (
              <div style={listStyles.sm}>
                {rowStatus?.icon && (
                  <ListItemIcon>{rowStatus.icon}</ListItemIcon>
                )}
                <OverflowTypography
                  title={rowStatus?.label || ''}
                  sxProps={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                />
              </div>
            )}

            {rowStatusChildren}

            {rowChildren}

            {displayAuthor && (
              <div style={rowAuthorStyle}>
                <OverflowTypography title={displayAuthor} />
              </div>
            )}

            {displayDate && (
              <div style={listStyles.xs}>
                <OverflowTypography
                  title={formatDisplayDateTime({ databaseDate: displayDate })}
                />
              </div>
            )}

            {rowActions && rowActions?.length > 0 && (
              <div
                style={{
                  ...listStyles.action,
                  minWidth: minActionWidth,
                }}
              >
                {rowActions.map((action: RowAction, index: number) => (
                  <React.Fragment key={'action_' + index}>
                    {/* Don't Render View Globally If Edit Included in The List*/}
                    {!action.hidden && (
                      // eslint-disable-next-line react/jsx-no-useless-fragment
                      <>
                        {action.isButton ? (
                          action.icon
                        ) : (
                          <ButtonIcon
                            // name="button-action"
                            name={'action-' + action.tooltip}
                            props={{
                              disabled:
                                isDeleting || action?.disabled ? true : false,
                              onClick: (event) => {
                                event.stopPropagation(); // <-- this stops the click going through to the parent item
                                if (onActionSelect) {
                                  onActionSelect(index);
                                }
                              },
                            }}
                          >
                            <Tooltip
                              arrow
                              enterDelay={500}
                              enterNextDelay={500}
                              title={action.tooltip}
                            >
                              {action.icon}
                            </Tooltip>
                          </ButtonIcon>
                        )}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
          {children}
        </Box>
      )}
    </>
  );
}
export default ActionRow;

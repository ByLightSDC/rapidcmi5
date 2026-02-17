// @ts-nocheck
//TODO upgrading from MUI 5 to 6 broke List with component property
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';
/* MUI */
import Divider, { DividerProps } from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemPerformant from './ListItemPerformant';
import { equalsNoCase } from '../utility/string';

/**
 * interface for list items
 *
 * @interface iListItemType
 * @prop {boolean} [shouldShowColumnHeaders = true] Whether to render column headers
 * @prop {string} [testId] Test Id
 * @prop {any[]} items Data array used to populate list columns
 * @prop {DividerProps} [dividerProps] Props to override sx properties provided to divider
 * @prop {(item: any) => JSX.Element} [renderItem] Element used to render row
 * @prop {any} [sxProps] Props to override sx properties provided to list view
 * @prop {string} [title] Title presented above the list view
 * @prop {JSX.Element} [titleRow] Title elements presented above the list view
 * @prop {(item: any) => void} [onRowSelect] Callback that fires when row is selected
 * @prop {boolean} [isPerformant = true] Whether to render list items in a performant manner
 */
export interface ListViewProps {
  shouldShowColumnHeaders?: boolean;
  testId?: string;
  items: any[];
  dividerProps?: DividerProps;
  renderItem?: (item: any, index?: number) => JSX.Element;
  sxProps?: any;
  title?: string;
  titleRow?: JSX.Element;
  onRowSelect?: (item: any) => void;
  isPerformant?: boolean;
}

//const listRowHeight = '24px'; //condensed
const listRowHeight = '38px';

//CSS and Typescript issue responsible for as const statement
// described here https://github.com/cssinjs/jss/issues/1344

const verticalRowStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'space-between',
  width: '100%',
  overflow: 'hidden',
  //Do not set vertical padding and margins!!!
  //DO not set maxHeight, this row expands vertical to fit child list
  margin: '0px',
  padding: '0px',
};

const rowStyle = {
  display: 'flex',
  flexDirection: 'row' as const,
  justifyContent: 'space-between',
  width: '100%',
  overflow: 'hidden',
  //Do not set vertical padding and margins!!!
  //Do not set maxHeight!!! we may need to wrap names
  minHeight: listRowHeight,
  margin: '0px',
  padding: '0px',
  alignItems: 'center',
};

const shortRowStyle = {
  ...rowStyle,
  minHeight: '18px',
  height: '18px',
};

const childRow = {
  marginLeft: '16px',
  width: 'calc(100% - 16px)', //was 98% but this caused horizontal scroll to show in some situations
};

const columnNameStyle = {
  display: 'flex',
  flexDirection: 'row' as const,
  alignItems: 'center',
  width: '100%',
  minWidth: '28px', // reduced from 128px so it will handle narrow window dimensions
  maxHeight: listRowHeight,
  marginLeft: '8px',
};

const mdColumnOverrides = {
  width: '80%',
  minWidth: '28px',
};

const smColumnOverrides = {
  width: '60%',
  minWidth: '28px',
};

const xsColumnOverrides = {
  width: '45%', //width must be atleast 45 for date to show day, month, year
  minWidth: '28px',
};

const xxsColumnOverrides = {
  width: '10%',
  minWidth: '28px',
};

//no width makes it stretch to fit
const fitColumnStyle = {
  display: 'flex',
  alignItems: 'center',
  maxHeight: listRowHeight,
  marginLeft: '16px',
};

// full height so clicking anywhere in the column will be the link
const linkColumnDivStyle = {
  height: listRowHeight,
};

export const actionColumnStyle = {
  display: 'flex',
  alignItems: 'center',
  maxHeight: listRowHeight,
  marginLeft: '24px',
  justifyContent: 'flex-end',
};

export const listStyles = {
  childRow: childRow,
  row: rowStyle,
  shortRow: shortRowStyle,
  verticalRow: verticalRowStyle,
  columnName: columnNameStyle,
  md: { ...columnNameStyle, ...mdColumnOverrides },
  sm: { ...columnNameStyle, ...smColumnOverrides },
  xs: { ...columnNameStyle, ...xsColumnOverrides },
  xxs: { ...columnNameStyle, ...xxsColumnOverrides },
  fit: fitColumnStyle,
  action: actionColumnStyle,
  linkDiv: linkColumnDivStyle,
};

/**
 * Displays list of items, filters, and title
 * @param {RangeNetwork} testId
 * @param {ListViewProps} props
 * @return {JSX.Element} Rendered list view
 */
export function ListView({
  shouldShowColumnHeaders = false,
  testId = 'item_list',
  items = [],
  renderItem,
  dividerProps = {
    sx: { borderBottomWidth: 1 },
    light: false,
  },
  sxProps,
  title,
  titleRow,
  onRowSelect,
  isPerformant = true,
}: ListViewProps) {
  const defaultItem = (item: any, index?: number) => (
    <Typography variant="body1">{item.name}</Typography>
  );

  const styledItem = (item: any, index?: number) => {
    return renderItem ? renderItem(item, index) : defaultItem(item, index);
  };

  const listItemParentRef = useRef(null);

  // useEffect(() => {
  //   console.log('List View items', items);
  // }, [items]);

  const getListItem = (index: number, item: any) => {
    return (
      <ListItem
        id={testId + '-' + index}
        disablePadding
        button
        role="listitem"
        sx={{ marginLeft: 0, height: 'auto' }} //list item will expand to fit children
        onClick={() => {
          if (onRowSelect) {
            onRowSelect(item);
          }
        }}
      >
        <>{styledItem(item, index)}</>
      </ListItem>
    );
  };

  return (
    <section
      role="list"
      style={{
        width: '100%',
        //REF height: '100%' No visible effect in Portal. Pushes the pagination component downwards in Storybook.
        overflow: 'hidden',
      }}
    >
      {/* moved title above scrolled area */}
      {title && <Typography>{title}</Typography>}
      {!title && titleRow && titleRow}
      <div
        ref={listItemParentRef}
        className="scrollingDiv"
        style={{
          height: 'auto',
          maxHeight: sxProps?.maxHeight ?? '100%',
        }}
      >
        <List
          data-testid={testId}
          id={testId}
          sx={{ width: '100%', ...sxProps }}
          disablePadding
        >
          {/* Create Row Header and pass -1 as index */}
          {shouldShowColumnHeaders && items.length > 0 && (
            <>
              {styledItem(items[0], -1)}
              <Divider {...dividerProps} />
            </>
          )}
          {/* Reason - If you arent displaying title column, you don't need to separate any elements from list <Divider {...dividerProps} /> */}
          {/* Create Rows starting at index 0 */}
          {items.map((item: any, index) => (
            <React.Fragment key={testId + '_' + index}>
              {isPerformant ? (
                <ListItemPerformant parent={listItemParentRef} index={index}>
                  {getListItem(index, item)}
                </ListItemPerformant>
              ) : (
                getListItem(index, item)
              )}

              {index < items.length - 1 &&
                // handle case where resource item has been deleted -- it's "hidden" so don't show another divider
                (!item.status ||
                  (item.status && !equalsNoCase(item.status, 'Deleting'))) && (
                  <Divider {...dividerProps} />
                )}
            </React.Fragment>
          ))}
        </List>
      </div>
    </section>
  );
}
export default ListView;

import React, { useState } from 'react';

import ExtensionIcon from '@mui/icons-material/Extension';
import { range, uniq } from 'lodash';
import { ActionRow } from './ActionRow';

export type simpleRowData = {
  name: string;
  author: string;
  dateEdited: string;
};

type tProps = {
  listData: simpleRowData[];
};

export default function SampleMultiSelectList(props: tProps) {
  const { listData } = props;

  const [checked, setChecked] = useState<number[]>([]);
  const [lastRowClicked, setLastRowClicked] = useState<number | null>(null);

  /**
   * Turns row(s) on/off based on status of row clicked and whether shifh key is on
   * @param {any} data Data for current row selected
   * @param {number} rowIndex Index of current row selected
   * @param {boolean} shiftKeyOn Whether shift key is currently being held down
   */
  const handleRowClick = (
    data: any,
    rowIndex: number,
    shiftKeyOn?: boolean,
  ) => {
    /*
     * Similar to the way gmail works:
     * if shift key is on, all rows between the lastRowClicked and current row clicked (inclusive)
     * are turned on or off - toggling based on status of the row just clicked
     * if shift key is off, only the row just clicked is affected - toggling its status
     */
    const arrayIndex = checked.findIndex((element) => element === rowIndex);

    if (lastRowClicked !== null && shiftKeyOn) {
      const start = Math.min(lastRowClicked, rowIndex);
      const end = Math.max(lastRowClicked, rowIndex);
      if (arrayIndex < 0) {
        // turn rows on
        setChecked((prev) => {
          return uniq([...prev, ...range(start, end), end]);
        });
      } else {
        // turn rows off
        setChecked((prev) => prev.filter((i) => i < start || i > end));
      }
    } else {
      if (arrayIndex === -1) {
        //unchecked - turn it on
        setChecked((prev) => [...prev, rowIndex]);
      } else {
        setChecked((prev) => prev.filter((i) => i !== rowIndex));
      }
    }
    setLastRowClicked(rowIndex);
  };

  return (
    <>
      <div>Hold shift key to select multiple at once </div>

      {listData.map((data: simpleRowData, index: number) => {
        const selIndex = checked.indexOf(index);
        return (
          <React.Fragment key={index}>
            <ActionRow
              data={data}
              isSelected={selIndex >= 0}
              isTitleDisplay={index === -1}
              rowIcon={<ExtensionIcon />}
              rowAuthor={data.author}
              rowTitle={data.name || ''}
              rowDate={data.dateEdited}
              rowActions={[]}
              showMultiSelectedStyles={true}
              onRowSelect={(data?: any, shiftKeyOn?: boolean) =>
                handleRowClick(data, index, shiftKeyOn)
              }
            />
          </React.Fragment>
        );
      })}
    </>
  );
}

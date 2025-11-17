/* eslint-disable react/jsx-no-useless-fragment */

import React, { useEffect, useState } from 'react';

/* BRANDED */
import { ActionRow, ActionRowProps } from '@rangeos-nx/ui/branded';

import {
  useGetCacheMultipleSelection,
  useSetCacheMultipleSelection,
} from '@rangeos-nx/ui/redux';

/* MUI */
import ListItemIcon from '@mui/material/ListItemIcon';

/* Icons */
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

/**
 * Props for ActionRowExpandable
 * @interface tActionRowExpandableProps
 * @extends ActionRowProps
 * @prop {JSX.Element} expansionChildren Child info to display when row is expanded
 * @prop {string} [touchRowCacheKey] Key for selection cache to persist which row(s) are expanded
 */
interface tActionRowExpandableProps extends ActionRowProps {
  expansionChildren: JSX.Element;
  touchRowCacheKey?: string;
  onSetIsExpanded?: (isExpanded: boolean) => void;
}

/**
 * Expandable Action Row
 * @param {tActionRowExpandableProps} props Props for expandable action row
 * @returns
 */
export function ActionRowExpandable(props: tActionRowExpandableProps) {
  const { data, expansionChildren, touchRowCacheKey, onSetIsExpanded } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const setMultiSelectionCache = useSetCacheMultipleSelection();
  const getMultiSelectionCache = useGetCacheMultipleSelection();

  const iconTransform = isExpanded ? 'rotate(180deg)' : 'rotate(90deg)';

  const handleParentRowClicked = () => {
    const willExpand = !isExpanded;
    setIsExpanded(willExpand);
    if (onSetIsExpanded) {
      onSetIsExpanded(willExpand);
    }

    //Update Expanded row cache
    if (touchRowCacheKey) {
      let touchList =
        getMultiSelectionCache(touchRowCacheKey)?.selections || [];
      touchList = [...touchList];

      const foundIndex = touchList.indexOf(data.uuid);
      if (willExpand) {
        if (foundIndex < 0) {
          touchList.push(data.uuid);
        }
      } else {
        if (foundIndex >= 0) {
          touchList = touchList.filter((pkgUuid) => pkgUuid !== data.uuid);
        }
      }
      setMultiSelectionCache(touchRowCacheKey, touchList);
    }
  };

  /**
   * UE implements previously expanded row on mount
   */
  useEffect(() => {
    if (touchRowCacheKey) {
      const touchList =
        getMultiSelectionCache(touchRowCacheKey)?.selections || [];
      if (touchList.indexOf(data.uuid) >= 0) {
        setIsExpanded(true);
        if (onSetIsExpanded) {
          onSetIsExpanded(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.uuid, touchRowCacheKey]);

  return (
    <ActionRow
      {...props}
      rowIcon={
        <ListItemIcon>
          <ExpandLessIcon color="primary" sx={{ transform: iconTransform }} />
        </ListItemIcon>
      }
      onRowSelect={handleParentRowClicked}
    >
      {isExpanded && expansionChildren ? <>{expansionChildren}</> : undefined}
    </ActionRow>
  );
}
export default ActionRowExpandable;

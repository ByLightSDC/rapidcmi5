
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

import {
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Stack,
} from '@mui/material';
import { Box } from '@mui/system';
import { DeployedAutoGrader, AutoGraderMetadata } from '@rangeos-nx/frontend/clients/hooks';
import { listStyles, OverflowTypography, actionRowHeaderColor } from '@rapid-cmi5/ui';
import { useEffect, useMemo, useState } from 'react';


type Props = {
  counter: number;
  data?: DeployedAutoGrader;
  isTitleDisplay?: boolean;
  primaryRowTitle?: string;
  rowIndex?: number;
  scenarioId: string;
  onActionSelect?: () => void;
};
const auCompletionDivWidth = '130px';

/**
 * Custom action row to display Autograders
 * @param props
 * @returns
 */
export default function TeamRangeResourceAutoGraderActionActionRow(
  props: Props,
) {
  const {
    data = { autograder: undefined, result: undefined }, //is complete = data.result.success
    primaryRowTitle = 'Name',
    rowIndex = 0,
    isTitleDisplay,
  } = props;

  /**
   * Quiz Question
   */
  const quizQuestion = useMemo(() => {
    if (
      data?.autograder?.metadata &&
      Object.prototype.hasOwnProperty.call(
        data?.autograder?.metadata,
        'rangeOsUI',
      )
    ) {
      try {
        const uiData: AutoGraderMetadata = data.autograder
          .metadata as AutoGraderMetadata;
        return uiData.rangeOsUI?.quizQuestion?.question;
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }, [data?.autograder?.metadata]);

  /**
   * UE Detects success change
   */
  useEffect(() => {
    if (data?.result?.success === true) {
      //TODO @Matt
      //compare to cache
      //send LRS verbs
    }
  }, [data?.result?.success]);

  return (
    <Stack direction="column" sx={{ width: '100%' }}>
      {isTitleDisplay ? (
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
      ) : (
        <>
          <ListItem
            sx={{ margin: '0px' }}
            secondaryAction={
              data?.result?.success ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: auCompletionDivWidth,
                  }}
                >
                  <CheckCircleIcon color="success" sx={{ fontSize: 24 }} />
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                      padding: '4px',
                    }}
                  >
                    Completed
                  </Typography>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: auCompletionDivWidth,
                  }}
                >
                  <HourglassBottomIcon
                    color="info"
                    sx={{
                      fontSize: 24,
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                      padding: '4px',
                    }}
                  >
                    Not Completed
                  </Typography>
                </div>
              )
            }
          >
            <ListItemAvatar>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{
                  padding: '2px',
                }}
              >
                {rowIndex + 1}
              </Typography>
            </ListItemAvatar>
            <ListItemText primary={data?.autograder?.name} />
          </ListItem>
          <ListItem sx={{ paddingLeft: 9, margin: '0px' }}>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontStyle="italic"
                >
                  {quizQuestion}
                </Typography>
              }
            />
          </ListItem>
        </>
      )}
    </Stack>
  );
}

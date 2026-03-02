import { useCellValue, usePublisher } from '@mdxeditor/gurx';
import { ContainerDirective } from 'mdast-util-directive';
import { rapidIconFor, RapidIconKey } from '../../editors/Icons';
import { insertActivityDirective$ } from '../../plugins/Activity';

import { useSelector } from 'react-redux';
import { useEffect, useMemo } from 'react';
import { Box, MenuItem, Stack, Typography, useTheme } from '@mui/material';
import {
  RC5ActivityTypeEnum,
  getActivityTypeFromDisplayName,
  activityLabels,
  AdmonitionTypeEnum,
  admonitionLabels,
} from '@rapid-cmi5/cmi5-build-common';
import { ButtonMinorUi, capitalizeFirstLetter } from '@rapid-cmi5/ui';
import { scenario, teamScenario } from '../../../../redux/courseBuilderReducer';
import { DeleteForever, LocalActivity } from '@mui/icons-material';
import { directiveDescriptors$, insertDirective$ } from '@mdxeditor/editor';

/**
 * Icons
 */
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoIcon from '@mui/icons-material/Info';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import DoneIcon from '@mui/icons-material/Done';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BoltIcon from '@mui/icons-material/Bolt';
import BugReportIcon from '@mui/icons-material/BugReport';
import NotesIcon from '@mui/icons-material/Notes';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

/**
 * A toolbar dropdown button that allows the user to insert admonitions.
 * For this to work, you need to have the `directives` plugin enabled with the {@link AdmonitionDirectiveDescriptor} configured.
 *
 * @group Toolbar Components
 */
export const InsertAdmonitions = () => {
  const insertDirective = usePublisher(insertDirective$);
  const directiveDescriptors = useCellValue(directiveDescriptors$);
  const theme = useTheme();

  /**
   * Handles Insert
   * @param admonitionLabel 
   */
  const handleSelect = (admonitionLabel: string) => {
    insertDirective({
      type: 'containerDirective',
      name: admonitionLabel,
      attributes: {
        title: capitalizeFirstLetter(admonitionLabel),
        collapse: 'closed',
      },
    });
  };

  /**
   * icon theme colors are ignored when elements are nested in toolbar
   * so we have to explicitly set colors
   */
  const allIcons: { [key: string]: JSX.Element } = useMemo(() => {
    return {
      note: <ModeEditIcon sx={{ color: 'inherit', fill: '#03a9f4' }} />,
      abstract: <AssignmentIcon sx={{ color: 'inherit', fill: '#03a9f4' }} />,
      info: <InfoIcon sx={{ color: 'inherit', fill: '#03a9f4' }} />,
      tip: <WhatshotIcon sx={{ color: 'inherit', fill: '#03a9f4' }} />,
      success: <DoneIcon sx={{ color: 'inherit', fill: '#4caf50' }} />,
      question: <QuestionMarkIcon sx={{ color: 'inherit', fill: '#03a9f4' }} />,
      warning: <ReportProblemIcon sx={{ color: 'inherit', fill: '#ff9800' }} />,
      failure: <ErrorOutlineIcon sx={{ color: 'inherit', fill: '#EF5350' }} />,
      danger: <BoltIcon sx={{ color: 'inherit', fill: '#EF5350' }} />,
      bug: <BugReportIcon sx={{ color: 'inherit', fill: '#EF5350' }} />,
      example: <NotesIcon sx={{ color: 'inherit', fill: '#9873FE' }} />,
      quote: <FormatQuoteIcon sx={{ color: 'inherit', fill: 'grey' }} />,
    };
  }, []);

  useEffect(() => {
    //console.log('directiveDescriptors', directiveDescriptors);
  }, [directiveDescriptors]);

  return (
    <Stack direction="column">
      <>
        {admonitionLabels.map((option: string, index) => {
          const startIcon: any = (
            <>
              <AddIcon
                sx={{
                  color: theme.palette.primary.main,
                  fill: theme.palette.primary.main,
                }}
              />
              {allIcons[option]}
            </>
          );
          return (
            <ButtonMinorUi
              key={`admonition_${index}`}
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                margin: 0.5,
                padding: 1,
                //color: 'text.primary',
              }}
              startIcon={startIcon}
              onClick={() => {
                handleSelect(option);
              }}
            >
              {option}
            </ButtonMinorUi>
          );
        })}
      </>
    </Stack>
  );
};

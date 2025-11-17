/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
/*
Accordion renders cards on a dashboard
*/
import { useEffect, useState } from 'react';

/* MUI */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Accordion, { AccordionProps } from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
/*MUI Icons */
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled, Theme } from '@mui/material';

export type AccordionSummaryData = {
  id: string;
  name: string;
  defaultOpen?: boolean;
};

export interface AccordionUiProps {
  summaries: Array<AccordionSummaryData>;
  details: Array<JSX.Element>;
  muiProps?: AccordionProps;
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const StyledAccordion = styled(Accordion)(
  ({ theme }: { theme: Theme }) => ({
    border: `0px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
  }),
);

export const StyledAccordionSummary = styled(AccordionSummary)(
  ({ theme }: { theme: Theme }) => ({
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper': { marginRight: 1 },
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(180deg)',
    },
    /*'& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },*/
  }),
);

export function AccordionUi(props: AccordionUiProps) {
  const { summaries, details, muiProps = {} } = props;
  const [expanded, setExpanded] = useState<boolean[]>([]);

  useEffect(() => {
    let defaultExpandedState: boolean[] = new Array();
    summaries.map((category: AccordionSummaryData) => {
      defaultExpandedState.push(category.defaultOpen || true);
    });
    setExpanded(defaultExpandedState);
  }, []);

  if (expanded.length === 0) {
    return <Box />;
  }

  return (
    <Box
      sx={{
        width: '100%',
      }}
      data-testid="accordion-ui"
    >
      {summaries?.map((category: AccordionSummaryData, index: number) => (
        <StyledAccordion
          key={category.id}
          disableGutters
          defaultExpanded={false}
          elevation={0}
          {...muiProps}
        >
          <StyledAccordionSummary
            expandIcon={<ExpandMoreIcon color="primary" />}
          >
            <Typography
              color="primary"
              variant="body2"
              sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}
            >
              {category.name}
            </Typography>
          </StyledAccordionSummary>
          <AccordionDetails
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              flexDirection: 'row',
            }}
          >
            {details[index]}
          </AccordionDetails>
        </StyledAccordion>
      ))}
    </Box>
  );
}

export default AccordionUi;

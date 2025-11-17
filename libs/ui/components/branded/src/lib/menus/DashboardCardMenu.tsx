/*
DashboardCardMenu renders cards on a dashboard
*/
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { touched, setTouched } from '../surfaces/accordion/accordionReducer';

import { DefaultCard } from '../cards/DefaultCard';

import {
  StyledAccordion,
  StyledAccordionSummary,
} from '../surfaces/accordion/Accordion';
import { sortAlphabeticalByName } from '../utility/sort';

/* MUI */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
/*MUI Icons */
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AccordionSummary } from '@mui/material';

export type DashboardCardMenuCategory = {
  id: string;
  name: string;
  data: Array<any>;
  defaultOpen?: boolean;
};

export type DashboardCardMenuCard = {
  name: string;
  url: string;
  hidden?: boolean;
  tagline?: string;
};

export interface DashboardCardMenuProps {
  data: Array<DashboardCardMenuCategory>;
  onCardSelect: (arg0: string, arg1: number) => void;
  colorLabel1?: JSX.Element;
  colorLabel2?: JSX.Element;
}

export function DashboardCardMenu(props: DashboardCardMenuProps) {
  const { data, onCardSelect, colorLabel1, colorLabel2 } = props;
  const [expanded, setExpanded] = useState<boolean[]>([]); //REF for future default expanded state, not currently used
  const cache = useSelector(touched);
  const dispatch: any = useDispatch();

  const handleChange =
    (id: string, index: number) =>
    (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
      var clone = { ...cache, [id]: isExpanded };
      dispatch(setTouched(clone));
    };

  //create array of open states from data provider
  useEffect(() => {
    let defaultExpandedState: boolean[] = new Array();

    data.map((category: DashboardCardMenuCategory) => {
      if (cache.hasOwnProperty(category?.id)) {
        defaultExpandedState.push(cache[category?.id]);
      } else {
        defaultExpandedState.push(category.defaultOpen || true);
      }
    });
    setExpanded(defaultExpandedState);
  }, []);

  if (expanded.length === 0) {
    return <Box />;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (
    <Box
      sx={{
        width: '100%',
      }}
      data-testid="dashboard-card-menu"
    >
      <Box
        sx={{
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: (theme: any) => `${theme.accordion.borderColor}`,
          borderRadius: '6px',
        }}
      >
        {data?.map((category: DashboardCardMenuCategory, index: number) => (
          <StyledAccordion
            key={category.id}
            disableGutters
            defaultExpanded={expanded[index]}
            elevation={0}
            onChange={handleChange(category.id, index)}
            // sx={expanded[index] ? {marginBottom:'4px', marginTop:'4px'}:{}}
          >
            <AccordionSummary
              sx={{
                borderBottom: (theme: any) => `${theme.accordion.borderBottom}`,
                backgroundColor: (theme: any) =>
                  `${theme.accordion.titleBackgroundColor}`,
                flexDirection: 'row-reverse',
                '& .MuiAccordionSummary-expandIconWrapper': { marginRight: 1 },
                '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                  transform: 'rotate(180deg)',
                },
              }}
              expandIcon={
                <ExpandMoreIcon
                  sx={{
                    color: (theme: any) => `${theme.palette.text.primary}`,
                  }}
                />
              }
            >
              <Typography
                color="primary"
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  color: (theme: any) => `${theme.palette.text.primary}`,
                }}
              >
                {category.name}
              </Typography>
              {index === 0 && colorLabel1}
            </AccordionSummary>
            <AccordionDetails
              sx={{
                backgroundColor: (theme: any) =>
                  `${theme.accordion.backgroundColor}`,
                display: 'flex',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                flexDirection: 'row',
              }}
            >
              {category.data
                .sort(sortAlphabeticalByName)
                .map((card: DashboardCardMenuCard, cardIndex: number) => (
                  <React.Fragment key={'card' + cardIndex}>
                    {index === 0 && colorLabel2}
                    {!card.hidden && (
                      <DefaultCard
                        key={'card' + cardIndex}
                        name={card.name}
                        tagline={card.tagline}
                        index={cardIndex}
                        onCardSelect={() =>
                          onCardSelect(category.id, cardIndex)
                        }
                      />
                    )}
                  </React.Fragment>
                ))}
            </AccordionDetails>
          </StyledAccordion>
        ))}
      </Box>
    </Box>
  );
}

export default DashboardCardMenu;

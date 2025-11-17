import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
} from '@mui/material';
import TocIcon from '@mui/icons-material/Toc';
import { useEffect, useState } from 'react';

export const TOC_LINK_CLICK = 'tocLinkClick';

export default function CollapsibleTOC({
  children,
  lookupState,
  slideNumber,
}: {
  children: any;
  lookupState: any;
  slideNumber: number;
}) {
  const [myKey, setMyKey] = useState<string>();
  const [isExpanded, setIsExpanded] = useState(false);

  const key = `toc-${slideNumber}`;

  const top =
    12 +
    (Object.prototype.hasOwnProperty.call(lookupState.current, 'slideTop')
      ? lookupState.current['slideTop']
      : 0);

  /**
   * Stores expanded state in look up
   */
  const toggleExpanded = () => {
    if (myKey) {
      lookupState.current[myKey] = !lookupState.current[myKey];
      setIsExpanded(lookupState.current[myKey]);
    }
  };

  /**
   * UE initializes expanded state vars
   * Resets key counter on unmount
   */
  useEffect(() => {
    setMyKey(key);

    if (Object.prototype.hasOwnProperty.call(lookupState.current, key)) {
      setIsExpanded(lookupState.current[key]);
    } else {
      lookupState.current[key] = false;
    }
  }, []);

  /**
   * UE to listen for TOC link clicks.
   * Cleans up event listener properly.
   */
  useEffect(() => {
    // handle a TOC link click
    const onTocLinkClick = () => {
      toggleExpanded();
    };

    // listen for TOC link clicks
    window.addEventListener(TOC_LINK_CLICK, onTocLinkClick);

    // clean up the event listener
    return () => window.removeEventListener(TOC_LINK_CLICK, onTocLinkClick);
  }, [toggleExpanded]);

  return (
    <Accordion
      expanded={isExpanded}
      onChange={toggleExpanded}
      className="text-sm"
      key="TOC"
      variant="outlined"
      sx={{
        zIndex: 9999,
        height: isExpanded ? '90%' : undefined, //fixes inf rendering issue in authoring mode
        overflow: 'auto',
        position: 'absolute',
        right: 24,
        top: top,
        maxWidth: '320px',
        backgroundColor: '#21212580',
        borderColor: 'info',
        borderStyle: 'solid',
        borderRadius: 2,
        borderWidth: '1px',
      }}
    >
      <AccordionSummary
        expandIcon={
          <TocIcon color="primary" sx={{ padding: '0px', margin: '0px' }} />
        }
      >
        {isExpanded && (
          <Typography align="center" sx={{ width: '100%', marginLeft: '12px' }}>
            Table of Contents
          </Typography>
        )}
      </AccordionSummary>
      {isExpanded && <AccordionDetails>{children}</AccordionDetails>}
    </Accordion>
  );
}

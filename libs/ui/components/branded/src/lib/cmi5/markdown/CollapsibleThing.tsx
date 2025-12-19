import React, { ReactElement, ReactNode, useEffect, useState } from 'react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Typography,
} from '@mui/material';

import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import {
  getAdmonitionColor,
  getAdmonitionHexColor,
  getAdmonitionIcon,
} from './components/AdmonitionStyles';
import { AdmonitionTypeEnum } from '@rapid-cmi5/cmi5-build/common';

/**
 * Admonition
 * This react component mirrors features from the MkDocs Material plugin
 * https://squidfunk.github.io/mkdocs-material/reference/admonitions/
 * @param param0
 * @returns
 */
export default function CollapsibleThing({
  admonitionType,
  children,
  keyPrefix = 'accordion',
  lookupState,
  defaultOpen = false,
}: {
  admonitionType: string;
  children: any;
  keyPrefix: string;
  lookupState: any;
  defaultOpen?: boolean;
}) {
  const [adColor, setAdColor] = useState<
    | 'info'
    | 'disabled'
    | 'action'
    | 'inherit'
    | 'success'
    | 'warning'
    | 'error'
    | 'primary'
    | 'secondary'
  >('info');
  const [adHexColor, setAdHexColor] = useState<string>('');
  const [adType, setAdType] = useState<AdmonitionTypeEnum>(
    AdmonitionTypeEnum.note,
  );
  const [isExpanded, setIsExpanded] = useState(defaultOpen);
  const [title, setTitle] = useState<React.ReactNode>('');
  const [content, setContent] = useState<any>(undefined);
  const [myKey, setMyKey] = useState<string>();
  // illustrates the issue const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Stores expanded state in look up
   */
  const handleAccordionChange = () => {
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
    lookupState.current.accordions = lookupState.current.accordions + 1;
    const newKey = `${keyPrefix}${lookupState.current.accordions}`;
    setMyKey(newKey);

    if (Object.prototype.hasOwnProperty.call(lookupState.current, newKey)) {
      setIsExpanded(lookupState.current[newKey]);
    } else {
      lookupState.current[newKey] = defaultOpen;
    }

    try {
      const adType: AdmonitionTypeEnum =
        AdmonitionTypeEnum[admonitionType as keyof typeof AdmonitionTypeEnum];
      setAdType(adType);
      setAdColor(getAdmonitionColor(adType));
      setAdHexColor(getAdmonitionHexColor(adType));
    } catch (e) {}

    return () => {
      lookupState.current.accordions = 0;
    };
  }, []);

  /**
   * UE parses content and title
   */
  useEffect(() => {
    const contentChildren: React.ReactNode[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        const element = child as ReactElement<{
          className?: string;
          children?: ReactNode;
        }>;
        if (element.props.className?.includes('collapsible-title')) {
          setTitle(element.props.children);
        } else {
          contentChildren.push(child);
        }
      } else {
        contentChildren.push(child);
      }
    });
    setContent(contentChildren);
  }, [children]);

  return (
    <Accordion
      key={myKey}
      defaultExpanded={defaultOpen}
      expanded={isExpanded}
      onChange={handleAccordionChange}
      style={{ margin: '1em 0' }}
      variant="outlined"
      sx={{
        borderColor: adHexColor || adColor,
        borderStyle: 'solid',
        borderRadius: 2,
        borderWidth: '1px',
      }}
    >
      <AccordionSummary
        id={myKey}
        aria-controls={myKey}
        expandIcon={
          adHexColor ? (
            <div style={{ color: adHexColor }}>
              <ExpandCircleDownIcon color={adColor} />
            </div>
          ) : (
            <ExpandCircleDownIcon color={adColor} />
          )
        }
      >
        {getAdmonitionIcon(adType)}
        <Typography sx={{ marginLeft: '12px' }}>{title}</Typography>
      </AccordionSummary>
      <Divider />
      <AccordionDetails>{content}</AccordionDetails>
    </Accordion>
  );
}

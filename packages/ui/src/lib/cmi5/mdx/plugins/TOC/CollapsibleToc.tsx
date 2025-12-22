import { useEffect, useState } from 'react';

import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  useTheme,
  Tooltip,
  Stack,
} from '@mui/material';
import TocIcon from '@mui/icons-material/Toc';
import { TableOfContentsEntry } from './TocPlugin';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box } from '@mui/system';

/**
 * TOCComponent (Table of Contents Component)
 *
 * Renders a collapsible, floating Table of Contents panel for an MDXEditor document.
 * Each entry in the `tocEntries` array is rendered as a clickable anchor link that
 * navigates to the corresponding heading in the document. The panel auto-collapses
 * when the TOC entries change (e.g. when switching documents or editing headings).
 *
 * Props:
 * - tocEntries: Array of tuples representing TOC entries. Each entry has the form:
 *   [key: NodeKey, text: string, tag: HeadingTagType, id: string]
 *   where:
 *     - key: Unique Lexical node key
 *     - text: Heading text
 *     - tag: Heading tag (e.g., 'h1', 'h2', etc.)
 *     - id: Unique string used for anchor navigation
 * - editor: Reference to the Lexical editor instance (currently unused but reserved for future interaction)
 * - topOffSet: Optional number to adjust the vertical position of the TOC container
 *
 * Intended Behavior:
 * - Renders a MUI Accordion positioned absolutely in the top-right corner of the page.
 * - Automatically resets the accordion's expanded state when `tocEntries` changes. (You add a header in edit more, or you naviagate to a new slide)
 * - On click of a TOC link, collapses the accordion and navigates to the corresponding anchor.
 *
 */
export const TOCComponent = ({
  tocEntries,
  editor,
  topOffSet = 0,
}: {
  tocEntries: Array<TableOfContentsEntry>;
  editor: any;
  topOffSet?: number;
}) => {
  // a function that will publish a new value into the viewMode cell

  const [basePath, setBasePath] = useState<string>(
    window.location.pathname + window.location.search,
  );

  useEffect(() => {
    setBasePath(window.location.pathname + window.location.search);
  }, [window.location.pathname, window.location.search]);

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsExpanded(false);
  }, [tocEntries]);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };
  const theme = useTheme();

  return (
    <Accordion
      expanded={isExpanded}
      onChange={toggleExpanded}
      key="TOC"
      variant="outlined"
      sx={{
        zIndex: 9990,
        height: isExpanded ? '80%' : undefined, //fixes inf rendering issue in authoring mode
        overflow: 'auto',
        position: 'absolute',
        right: 24,
        top: 12 + topOffSet,
        maxWidth: '320px',
        backgroundColor: 'background.default',
        borderColor: 'info',
        borderStyle: 'solid',
        borderRadius: 2,
        borderWidth: '1px',
        minHeight: 0,
        padding: '4px',
        margin: 0,
        marginTop: isExpanded ? 0:2
      }}
    >
      <AccordionSummary
        sx={{
          padding: 0,
          margin: 0,
          minHeight: 0,
          maxHeight: '32px', //hack to avoid extra vertical space below Table of Contents
        }}
        expandIcon={
          isExpanded ? null : (
            <Tooltip title="Table of Contents: Click to expand, then click on a heading to jump to its location in the slide.">
              <span>
                <TocIcon
                  color="primary"
                  sx={{
                    margin: '1px',
                    marginBottom: 0,
                    padding: '0px',
                  }}
                />
              </span>
            </Tooltip>
          )
        }
      >
        {isExpanded && (
          <Stack
            direction="row"
            sx={{
              
              marginLeft: '12px',
              marginRight: '12px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <TocIcon color="primary" sx={{ marginBottom: 0, padding: '0px' }} />
            <Typography
              variant="h5"
              align="center"
              color="text.primary"
              sx={{
                width: '100%',
                fontWeight: 500,
              }}
            >
              Table of Contents
            </Typography>
          </Stack>
        )}
      </AccordionSummary>
      {isExpanded && (
        <AccordionDetails
          sx={{
            padding: 0,
            margin: 0,
            marginTop: -2,
          }}
        >
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              marginTop: -8, //hack to bring list closer to bottom of Table of Contents
            }}
          >
            {tocEntries.map(([key, text, tag, id]) => (
              <li
                key={key}
                style={{
                  padding: '6px 12px',
                  marginLeft: `${(parseInt(tag[1]) - 1) * 12}px`,
                }}
              >
                <a
                  href={`${basePath}#${id}`}
                  style={{
                    textDecoration: 'none',
                    fontSize: '1rem',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  onClick={toggleExpanded}
                >
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </AccordionDetails>
      )}
    </Accordion>
  );
};

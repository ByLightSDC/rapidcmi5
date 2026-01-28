


import  { useState } from 'react';


import { Grid, IconButton, Stack } from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import LinkOffIcon from '@mui/icons-material/LinkOff';

import Popper from '@mui/material/Popper';
import { useTheme } from '@mui/system';

import LaunchIcon from '@mui/icons-material/Launch';
import EditIcon from '@mui/icons-material/Edit';
import { ButtonTooltip } from '@rapid-cmi5/ui';


export default function RC5LinkEditor({
  isOpen,
  onEditLink,
  onRemoveLink,
  linkNodeKey,
  ref,
  url,
  urlIsExternal,
  virtualElement,
}: {
  isOpen: boolean;
  onEditLink?: () => void;
  onRemoveLink?: () => void;
  linkNodeKey: string;
  ref?: any;
  url: string;
  urlIsExternal: boolean;
  virtualElement: any;
}) {
  const theme = useTheme();
  const [copyUrlTooltipOpen, setCopyUrlTooltipOpen] = useState(false);

  return (
    <Popper
      open={isOpen}
      anchorEl={virtualElement}
      autoFocus={true}
      placement={'bottom-start'}
    >
      <div
        key={linkNodeKey}
        ref={ref}
        className="paper-form"
        style={{
          backgroundColor: theme.palette['background']['paper'],
          borderStyle: 'solid',
          //TODO
          // @ts-ignore
          borderColor: theme.input.outlineColor,
          borderWidth: '1px',
          padding: '8px',
          display: 'flex',
          justifyContent: 'flex-start',
          alignContent: 'flex-start',
          alignItems: 'flex-start',
          flexDirection: 'row',
          marginTop: '20px',
        }}
      >
        <a
          href={url}
          {...(urlIsExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
          title=""
        >
          <span>{url}</span>
          {urlIsExternal && (
            <IconButton>
              <ButtonTooltip title="Open Link">
                <LaunchIcon />
              </ButtonTooltip>
            </IconButton>
          )}
        </a>
        {onEditLink && (
          <Stack direction="row" sx={{ marginLeft: '48px' }}>
            <IconButton
              onMouseUp={(e) => {
                onEditLink();
              }}
            >
              <ButtonTooltip title="Edit Link">
                <EditIcon />
              </ButtonTooltip>
            </IconButton>
            <IconButton
              onClick={() => {
                window.navigator.clipboard.writeText(url).then(() => {
                  setCopyUrlTooltipOpen(true);
                  setTimeout(() => {
                    setCopyUrlTooltipOpen(false);
                  }, 1000);
                });
              }}
            >
              <ButtonTooltip title="Copy Link">
                <FileCopyIcon />
              </ButtonTooltip>
            </IconButton>
            {onRemoveLink && (
              <IconButton
                onClick={() => {
                  onRemoveLink();
                }}
              >
                <ButtonTooltip title="Remove Link">
                  <LinkOffIcon />
                </ButtonTooltip>
              </IconButton>
            )}
          </Stack>
        )}
      </div>
    </Popper>
  );
}

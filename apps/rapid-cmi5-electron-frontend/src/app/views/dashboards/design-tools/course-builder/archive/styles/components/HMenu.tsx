import React, { useRef, useState } from 'react';
import ClickAwayListener from '@mui/material/ClickAwayListener';

/* Icon */
import MoreVertIcon from '@mui/icons-material/MoreVert';

/* MUI */
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { ToolButton, toolbuttonStyle } from './ToolButton';

/**
 * Provides Menu for selecting Header
 * @returns
 */
export default function HMenu({
  buttonIcon,
  options,
  tooltip = '',
  onSelection,
}: {
  buttonIcon?: JSX.Element;
  options: string[];
  tooltip?: string;
  onSelection: (optionIndex: number) => any;
}) {
  const boxRef = useRef<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const checkClickAway = (event: any) => {
    const box = boxRef.current.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    const isWithinBounds =
      x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;

    if (isOpen && !isWithinBounds) {
      setIsOpen(false);
    }
  };
  return (
    <>
      <ToolButton
        tooltip={tooltip}
        onClick={(event: React.MouseEvent<HTMLElement>) => {
          if (event) {
            event.stopPropagation(); //stops focus from leaving text field
          }
          setIsOpen(!isOpen);
        }}
      >
        {buttonIcon || <MoreVertIcon color="primary" />}
      </ToolButton>
      {isOpen && (
        <ClickAwayListener onClickAway={checkClickAway}>
          <Box
            ref={boxRef}
            sx={{
              position: 'absolute',
              left: 0,
              zIndex: 99,
              borderColor: 'primary.main',
              borderRadius: '6px',
              borderStyle: 'solid',
              borderWidth: '2px',
              boxShadow: 1,
              backgroundColor: toolbuttonStyle.backgroundColor, //(theme: any) => `${theme.nav.fill}`,
            }}
          >
            <List component="div" disablePadding>
              {options.map((item: any, index) => (
                <React.Fragment key={item + '_action'}>
                  <ListItemButton
                    sx={{
                      //color: (theme: any) => `${theme.nav.icon}`,
                      '&:hover': {
                        backgroundColor: '#a4b8eb80', //main color ,
                      },
                    }}
                    dense={true}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                      setIsOpen(false);
                      onSelection(index);
                    }}
                    // onClick={(event) => {
                    //   setIsOpen(false);
                    //   onSelection(index);
                    // }}
                    disabled={item.disabled}
                  >
                    <ListItemText
                      sx={{
                        color: 'inherit',
                        '&:hover': {
                          color: 'inherit',
                        },
                      }}
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                      secondaryTypographyProps={{ variant: 'subtitle2' }}
                      inset={false}
                      primary={item}
                    />
                  </ListItemButton>
                  {item.includeDivider && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </ClickAwayListener>
      )}
    </>
  );
}

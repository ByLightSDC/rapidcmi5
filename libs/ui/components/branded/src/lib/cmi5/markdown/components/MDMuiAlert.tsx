import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import Alert from '@mui/material/Alert';
import { AlertColor, AlertTitle, Box, TextField } from '@mui/material';
import {
  getAdmonitionColor,
  getAdmonitionHexColor,
  getAdmonitionIcon,
} from './AdmonitionStyles';
import { AdmonitionTypeEnum } from '@rapid-cmi5/cmi5-build/common';

export default function MDMuiAlert({
  admonitionType,
  children,
  title,
  editorIsFocused,
  readonly,
  onFocusHandler,
  onTitleChange,
}: {
  admonitionType: string;
  children: any;
  readonly?: boolean;
  title?: string;
  editorIsFocused?: boolean;
  onFocusHandler?: () => void;
  onTitleChange?: (e: any) => void;
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

  const [content, setContent] = useState<any>(undefined);

  const handleClick = () => {
    if (onFocusHandler) {
      onFocusHandler();
    }
  };

  /**
   * UE initializes expanded state vars
   * Resets key counter on unmount
   */
  useEffect(() => {
    try {
      const adType: AdmonitionTypeEnum =
        AdmonitionTypeEnum[admonitionType as keyof typeof AdmonitionTypeEnum];
      setAdType(adType);
      setAdColor(getAdmonitionColor(adType));
      setAdHexColor(getAdmonitionHexColor(adType));
    } catch (e) {}
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
        if (element.props.className?.includes('admonition-title')) {
          if (onTitleChange) {
            onTitleChange(element.props.children);
          }
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
    <Alert
      severity={adColor as AlertColor}
      color={adColor as AlertColor}
      icon={getAdmonitionIcon(adType)}
      variant="standard"
      sx={{
        borderColor: adHexColor || adColor,
        bgcolor: 'background.paper', //need until we implement a custom admonition component
        borderWidth: editorIsFocused ? '4px' : '2px',
      }}
      // onClick={handleClick}
      // onFocus={handleFocus}
    >
      <Box onClick={handleClick}>
        {title && readonly && (
          <AlertTitle color="text.primary" sx={{ fontWeight: 'bold' }}>
            {title}
          </AlertTitle>
        )}
        {title && !readonly && (
          <TextField
            autoComplete="off"
            sx={{
              fontWeight: 'bold',
              margin: 0,
              padding: 0,
              backgroundColor: 'transparent',
            }}
            value={title}
            placeholder="Title Goes Here"
            margin="dense"
            variant="outlined"
            fullWidth={true}
            size="small"
            slotProps={{ input: { margin: 'none' } }}
            spellCheck={false}
            onChange={(event) => {
              if (onTitleChange) {
                onTitleChange(event.target.value);
              }
            }}
          />
        )}
        <Box
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            //REF see text area ux snafu backgroundColor: 'pink',
            minWidth: '100px', //this helps input area
            minHeight: '40px',
          }}
        >
          {content}
        </Box>
      </Box>
    </Alert>
  );
}

import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

const myGrey = '#2E2E2E';
const myDarkGray = '#1D1D1D';
const myLightGray = '#3F3F3F';
const myDarkBlue = '#0063BE';

export const toolbuttonStyle = {
  backgroundColor: myLightGray,
  borderColor: 'red', //myGrey,
  borderStyle: 'solid',
  borderWidth: '2px',
  borderRadius: '2px',
  width: '32px',
  height: '32px',
};

export function ToolButton({
  props,
  onClick,
  children,
  tooltip,
  isMouseUp = true,
}: {
  props?: IconButtonProps;
  tooltip?: string;
  onClick: any;
  children: JSX.Element | string;
  isMouseUp?: boolean;
}) {
  const handleFocus = () => {
    console.log('Style Button handleFocus');
  };

  return (
    <IconButton
      autoFocus={false}
      sx={{ ...toolbuttonStyle, borderColor: 'primary.main' }}
      aria-label={tooltip}
      color="inherit"
      onMouseDown={(event: React.MouseEvent<HTMLElement>) => {
        if (!isMouseUp) {
          event.preventDefault();
          onClick(event);
        }
      }}
      onMouseUp={(event: React.MouseEvent<HTMLElement>) => {
        if (isMouseUp) {
          event.preventDefault();
          onClick(event);
        }
      }}
      onFocus={handleFocus}
      {...props}
    >
      {tooltip ? (
        <Tooltip arrow title={tooltip}>
          {children as JSX.Element}
        </Tooltip>
      ) : (
        (children as string)
      )}
    </IconButton>
  );
}

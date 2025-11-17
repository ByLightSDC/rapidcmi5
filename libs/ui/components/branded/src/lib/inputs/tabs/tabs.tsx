/* MUI */

import Tab, { TabProps } from '@mui/material/Tab';
import { styled, SxProps } from '@mui/system';

const StyledTab = styled(Tab)(({ theme }: { theme: any }) => ({
  margin: 4, //bw tabs
}));

export interface BrandedTabProps extends TabProps {
  label?: string;
  href?: string;
  sxProps?: SxProps;
}

export function LinkTab(props: BrandedTabProps) {
  return (
    <TabMainUi
      onClick={(event) => {
        event.preventDefault();
      }}
      {...props}
    />
  );
}

export function TabMainUi(props: BrandedTabProps) {
  const { sxProps, ...subset } = props;

  return (
    <StyledTab
      //REF icon={<SearchIcon />}
      //REF iconPosition="start"
      {...subset}
      sx={{
        '&:Mui-selected': {
          //this can only be overridden in theme file
        },
        maxHeight: '28px', //was 16
        minHeight: '0px',
        height: '28px', //was 16
        width: 'auto',
        minWidth: '0px',
        paddingLeft: '12px',
        paddingRight: '12px',
        margin: '0px',
        marginLeft: '4px',
        marginRight: '4px',
        ...sxProps,
      }}
    ></StyledTab>
  );
}

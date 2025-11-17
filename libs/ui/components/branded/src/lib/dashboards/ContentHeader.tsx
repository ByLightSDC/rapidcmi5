/* MUI */
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

type propTypes = {
  title: string | undefined;
  children?: JSX.Element | JSX.Element[];
  childContainerSxProps?: any;
  typographySize?: any;
};

/* REF this will cause stepper to align right
justifyContent: 'space-between',*/

export function ContentHeader({
  children,
  childContainerSxProps = {},
  typographySize = 'h3',
  title = ' ',
}: propTypes) {
  return (
    <>
      {!children && <></>}
      {children && <div style={{ minHeight: '32px' }}>{children}</div>}
    </>
    // <div role="heading" aria-level={1}>
    //   {' '}
    //   {/* Each Page title is displayed as the one and only h1 */}
    //   <Box
    //     sx={{
    //       alignItems: 'flex-end',
    //       alignContent: 'flex-end',
    //       display: 'flex',
    //       width: '100%',
    //       minHeight: 64,
    //       height: 64,
    //       padding: '0px',
    //       margin: '0px',
    //     }}
    //     data-testid="content-title-header"
    //   >
    //     <Typography
    //       variant={typographySize}
    //       className="content-header-text"
    //       sx={{
    //         width: 'auto',
    //         color: (theme: any) => `${theme.header.title}`,
    //         padding: '0px 0px 8px 16px',
    //       }}
    //     >
    //       {title}
    //       {/*REF  Underline Content Title <Divider
    //       orientation="horizontal"
    //       variant="fullWidth"
    //       sx={{
    //         boxShadow: 0,
    //         color: '#767676',
    //         borderBottomWidth: '4px',
    //         margin: '4px',
    //       }}
    //     />*/}
    //     </Typography>
    //     {children && (
    //       <Box
    //         sx={{
    //           display: 'flex',
    //           flexGrow: 2,
    //           height: '100%',
    //           alignItems: 'flex-end',
    //           justifyContent: 'flex-start',
    //           ...childContainerSxProps,
    //         }}
    //         data-testid="content-title-horizontal-children"
    //       >
    //         {children}
    //       </Box>
    //     )}
    //   </Box>
    //   {/*Separate title from content*/}
    //   <Divider
    //     orientation="horizontal"
    //     sx={{
    //       boxShadow: 0,
    //       borderBottomWidth: '2px',
    //     }}
    //   />
    // </div>
  );
}
export default ContentHeader;

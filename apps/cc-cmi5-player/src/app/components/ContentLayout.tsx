import { styled } from '@mui/system';

export const DRAWER_WIDTH = 240;

/**
 * The main content that is not the drawer.
 * This allows the content to transition with an easement.
 */
export const ContentLayout = styled('main', {
  shouldForwardProp: (prop: any) => prop !== 'open',
})<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(0),
  // @ts-ignore
  transition: theme.transitions.create('margin', {
    // @ts-ignore
    easing: theme.transitions.easing.sharp,
    // @ts-ignore
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${DRAWER_WIDTH}px`,
  variants: [
    {
      props: ({ open }: { open: boolean }) => open,
      style: {
        // @ts-ignore
        transition: theme.transitions.create('margin', {
          // @ts-ignore
          easing: theme.transitions.easing.easeOut,
          // @ts-ignore
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      },
    },
  ],
}));

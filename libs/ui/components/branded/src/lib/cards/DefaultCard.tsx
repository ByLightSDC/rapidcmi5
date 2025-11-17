/* eslint-disable react/jsx-no-useless-fragment */
import '../shared-styles.css';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export function DefaultCard({
  name = '',
  tagline,
  index,
  children,
  onCardSelect,
}: {
  name?: string; // pass this prop if you want to use the default card content of name only
  tagline?: string;
  index: number;
  children?: JSX.Element; // pass this prop to override content of the card
  onCardSelect?: (index: number) => void;
}) {
  const handleCardSelect = () => {
    if (onCardSelect) {
      onCardSelect(index);
    }
  };

  return (
    <Paper
      className="paper-card"
      sx={{
        background: (theme: any) => `${theme?.card?.default}`,
        borderColor: (theme: any) => `${theme?.card?.borderColor}`,
        borderWidth: '2px',
        borderRadius: '12px',
        color: (theme: any) => `${theme?.card?.titleColor}`,
        '&:hover': {
          background: (theme: any) => `${theme?.card?.defaultHover}`,
          borderColor: 'primary.light',
          cursor: 'pointer',
        },
        minWidth: '220px',
        height: '95px',
      }}
      variant="outlined"
      onClick={() => handleCardSelect()}
    >
      <>
        {children ? (
          <>{children}</>
        ) : (
          <Box role="button">
            <Typography align="center" variant="h3">
              {name}
            </Typography>
            {tagline && (
              <Typography
                align="center"
                //variant="caption"
                color="common.white"
                sx={{
                  lineHeight: 1.1,
                  fontSize: '13px',
                  marginTop: '2px',
                  width: '100%',
                }}
              >
                {tagline}
              </Typography>
            )}
          </Box>
        )}
      </>
    </Paper>
  );
}
export default DefaultCard;

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';


/* MUI */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/* Icons */
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { OverflowTypography } from '../../data-display/OverflowTypography';
import { bookmarkCue, tBookmark, popToBookmark } from './bookmarksReducer';
import { ButtonInfoField, ButtonTooltip } from '../../utility/buttons';

/**
 * Renders a list of interactable bookmark labels
 * Clicking a bookmark removes any bookmarks more recent than the target
 * And routes the user to the appropriate form or wizard route
 * @return {JSX.Element} React Component
 */
export function Bookmarks() {
  const bookmarkData = useSelector(bookmarkCue);
  const isShowing = true; //REF useSelector(shouldShowBookmarks);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (
    <nav aria-label="bookmarks navigation">
      {isShowing ? (
        <Box
          sx={{
            backgroundColor: (theme: any) => `${theme.header.dark}`,
            width: '240px',
            height: '90%',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'default',
            paddingLeft: '12px',
            paddingTop: '8px',
            borderRadius: '12px',
          }}
        >
          <div className="content-row-icons">
            <OverflowTypography
              title="Recent Forms"
              sx={{ padding: 0, margin: 0 }}
            />
            <ButtonInfoField
              message="When submitting or cancelling a form, we will try to return you to your previous form."
              props={{
                sx: {
                  margin: '0px 0px',
                },
              }}
            />
          </div>
          {bookmarkData?.length > 0 && (
            <>
              {bookmarkData
                .map((action: tBookmark, index: number) => {
                  const isActive =
                    index < bookmarkData.length - 1 ||
                    action.label === 'Unknown';

                  return (
                    <div
                      key={'bookmark-' + index}
                      style={{
                        cursor: isActive ? 'pointer' : 'default',
                        fontWeight: 'fontWeightMedium',
                      }}
                    >
                      <ButtonTooltip
                        id="bookmark-tooltip"
                        title={isActive ? 'Navigate to... ' + action.route : ''}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: '24px',
                            marginBottom: '2px',
                          }}
                        >
                          {index === bookmarkData.length - 1 && (
                            <ArrowRightIcon
                              sx={{ color: 'text.tint', fontSize: '16px' }}
                            />
                          )}
                          <Typography
                            sx={{
                              lineHeight: 1,
                              paddingTop: '2px', //centering does not work
                              marginRight: '2px',
                            }}
                            variant="caption"
                            color="text.tint"
                            onClick={() => {
                              if (isActive) {
                                dispatch(popToBookmark(index));
                                navigate(action.route);
                              }
                            }}
                          >
                            {action.label}
                          </Typography>
                        </div>
                      </ButtonTooltip>
                    </div>
                  );
                })
                .reverse()}
            </>
          )}
        </Box>
      ) : null}
    </nav>
  );
}

export default Bookmarks;

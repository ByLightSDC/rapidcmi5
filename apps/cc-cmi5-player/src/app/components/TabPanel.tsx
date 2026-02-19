import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useDispatch, useSelector } from 'react-redux';
import { auJsonSel, auLogoSel, courseAUProgressSel } from '../redux/auReducer';
import { activeTabSel, setActiveTab } from '../redux/navigationReducer';
import ProgressBar from './ProgressBar';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { CustomTheme } from '../styles/createPalette';

export default function TabPanel() {
  const auJson = useSelector(auJsonSel);
  const auLogo = useSelector(auLogoSel);
  const dispatch = useDispatch();
  const activeTab = useSelector(activeTabSel);
  const courseAUProgress = useSelector(courseAUProgressSel);
  const currentTheme: CustomTheme = useTheme();
  const tabClicked = (_: React.SyntheticEvent, newValue: number) => {
    dispatch(setActiveTab(newValue));
  };

  // Helper function to get slide status based on courseAUProgress
  const getSlideStatus = (slideIndex: number) => {
    if (
      !auJson?.slides?.[slideIndex] ||
      !courseAUProgress?.progress?.slideStatus
    ) {
      return { viewed: false, completed: false, passed: false, failed: false };
    }

    const slide = auJson.slides[slideIndex];
    const slideGuid = slide.filepath || `slide-${slideIndex}`;
    const slideStatus = courseAUProgress.progress.slideStatus[slideGuid];

    const status = {
      viewed: slideStatus?.viewed || false,
      completed: slideStatus?.completed || false,
      passed: slideStatus?.passed || false,
      failed: slideStatus?.failed || false,
    };

    return status;
  };

  // Helper function to get slide background color based on active status
  const getSlideBackgroundColor = (slideIndex: number) => {
    if (slideIndex === activeTab) {
      return 'rgba(0, 123, 255, 0.25)'; // Strong blue for active slide only
    }
    return ''; // No background for inactive slides
  };

  // Helper function to get the color for the active tab indicator (overrides MUI default)
  const getActiveTabIndicatorColor = () => {
    const status = getSlideStatus(activeTab);

    let color;
    if (status.failed) {
      color = currentTheme.palette.error.main; // Red indicator for failed active slide
    } else if (status.passed && !status.failed) {
      color = currentTheme.palette.success.main; // Green indicator for passed active slide (MUI success color)
    } else {
      color = '#007bff'; // Blue indicator for active slide with no status
    }

    return color;
  };

  // Helper function to get right border for each slide's pass/fail status
  const getSlideRightBorder = (slideIndex: number) => {
    const status = getSlideStatus(slideIndex);

    let border;
    // Don't add border to active slide (MUI indicator handles it)
    if (slideIndex === activeTab) {
      border = 'none'; // Let MUI indicator handle active slide
    } else if (status.failed) {
      border = `4px solid ${currentTheme.palette.error.main}`; // Red right border for failed slides
    } else if (status.passed && !status.failed) {
      border = `4px solid ${currentTheme.palette.success.main} `; // #4caf50 Green right border for passed slides (MUI success color)
    } else {
      border = 'none'; // No border for inactive, incomplete slides
    }

    return border;
  };

  // Helper function to get status icon for accessibility
  const getSlideStatusIcon = (slideIndex: number) => {
    const status = getSlideStatus(slideIndex);

    if (status.failed) {
      return (
        <CancelIcon
          sx={{
            color: currentTheme.palette.error.main,
            fontSize: '20px',
            height: '20px', // Fixed height
            width: '20px', // Fixed width
          }}
        />
      );
    } else if (status.passed && !status.failed) {
      return (
        <CheckCircleIcon
          sx={{
            color: currentTheme.palette.success.main,
            fontSize: '20px',
            height: '20px', // Fixed height
            width: '20px', // Fixed width
          }}
        />
      );
    }
    return null; // No icon for incomplete slides
  };

  return (
    <Box
      sx={{
        maxWidth: '260px',
        width: '100%',
        //left panel background
          bgcolor: currentTheme.palette.mode === 'light' ? '#8a91ac' :'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          zIndex: 50,
          pt: 0,
          display: 'flex',
          alignContent: 'center',
          borderRadius: 1,
        }}
      >
        {auLogo && (
          <img
            alt="logo"
            width="200px"
            style={{
              padding: '16px',
              paddingBottom: 0,
           
            }}
            src={auLogo}
          />
        )}
      </Box>
      <ProgressBar />
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={activeTab}
        onChange={tabClicked}
        scrollButtons={false}
        aria-label="Slides"
        sx={{
          width: '100%',
          //TABS background color
          bgcolor: 'background.default',
          color: 'white',
          '& .MuiTabs-indicator': {
            backgroundColor: getActiveTabIndicatorColor(),
            width: '4px',
          },
          '& .MuiTab-root': {
            minHeight: '48px',
            padding: '12px 16px',
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 'normal',
            lineHeight: '1.2',
            backgroundColor: 'background.default',
            borderStyle: 'solid',
            borderColor: currentTheme.input.outlineColor,
            borderRadius: 0,
            borderWidth: 1,
          },
          '& .MuiTab-root.Mui-selected': {
            fontWeight: 'bold',
            backgroundColor: '#3C59A266',
            borderStyle: 'none',
            borderColor: '#3C59A266',
            borderRadius: 0,
            borderWidth: 1,
          },
        }}
        textColor="inherit"
      >
        {auJson?.slides?.map((slide, index) => (
          <Tab
            sx={{
              width: '100%',
              backgroundColor: getSlideBackgroundColor(index),
              borderRight: getSlideRightBorder(index),
              position: 'relative',
              paddingRight: '4px',
              minHeight: '48px',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              display: 'flex',
            }}
            key={index}
            label={
              <Stack
                direction="row"
                sx={{
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '24px',
                }}
              >
                <Typography
                  variant="h5"
                  color="text.primary"
                  sx={{ flexGrow: 1 }}
                  align="center"
                >
                  {slide.slideTitle}
                </Typography>
                {getSlideStatusIcon(index)}
              </Stack>
            }
          />
        ))}
      </Tabs>
    </Box>
  );
}

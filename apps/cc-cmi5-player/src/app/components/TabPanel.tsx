import React, { useEffect, useRef, useState, useMemo } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useDispatch, useSelector } from 'react-redux';
import {
  auJsonSel,
  auLogoDarkSel,
  auLogoLightSel,
  courseAUProgressSel,
} from '../redux/auReducer';
import { activeTabSel, setActiveTab } from '../redux/navigationReducer';
import ProgressBar from './ProgressBar';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { CustomTheme } from '../styles/createPalette';

export default function TabPanel() {
  const auJson = useSelector(auJsonSel);
  const auLogoDark = useSelector(auLogoDarkSel);
  const auLogoLight = useSelector(auLogoLightSel);
  const dispatch = useDispatch();
  const activeTab = useSelector(activeTabSel);
  const courseAUProgress = useSelector(courseAUProgressSel);
  const currentTheme: CustomTheme = useTheme();

  const currentLogo = useMemo(() => {
    if (currentTheme.palette.mode === 'light') {
      return auLogoLight;
    }
    return auLogoDark;
  }, [currentTheme.palette.mode, auLogoDark, auLogoLight]);

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

  const isExitActive = activeTab === auJson?.slides?.length;

  // Track whether the Exit tab in the list is currently visible in the scroll container.
  // Only show the pinned Exit button at the bottom when the real one has scrolled out of view.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const exitTabRef = useRef<HTMLDivElement>(null);
  const [isExitTabVisible, setIsExitTabVisible] = useState(true);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const exitEl = exitTabRef.current;
    if (!scrollContainer || !exitEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsExitTabVisible(entry.isIntersecting),
      { root: scrollContainer, threshold: 0.5 },
    );
    observer.observe(exitEl);
    return () => observer.disconnect();
  }, [auJson?.slides?.length]);

  return (
    <Box
      sx={{
        maxWidth: '260px',
        width: '100%',
        height: '100vh',
        //left panel background
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Logo — fixed, never scrolls */}
      <Box
        sx={{
          zIndex: 50,
          pt: 0,
          display: 'flex',
          alignContent: 'center',
          borderRadius: 1,
          flexShrink: 0,
        }}
      >
        {currentLogo && (
          <img
            alt="logo"
            width="200px"
            style={{
              padding: '16px',
              paddingBottom: 0,
            }}
            src={currentLogo}
          />
        )}
      </Box>

      {/* Progress bar — fixed, never scrolls */}
      <Box sx={{ flexShrink: 0, width: '100%' }}>
        <ProgressBar />
      </Box>

      {/* Slide list — scrolls when there are many slides */}
      <Box
        ref={scrollContainerRef}
        sx={{ flex: 1, minHeight: 0, width: '100%', overflowY: 'auto' }}
      >
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
          {/* Exit tab in its natural position at the end of the list */}
          <Tab
            ref={exitTabRef}
            value={auJson?.slides?.length ?? 0}
            sx={{
              width: '100%',
              backgroundColor: isExitActive ? 'rgba(0, 123, 255, 0.25)' : '',
              position: 'relative',
              minHeight: '48px',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              display: 'flex',
            }}
            label={
              <Typography variant="h5" color="text.primary" align="center">
                Exit
              </Typography>
            }
          />
        </Tabs>
      </Box>

      {/* Pinned Exit — only appears when the real Exit tab has scrolled out of view */}
      {!isExitTabVisible && (
        <Box
          onClick={() => dispatch(setActiveTab(auJson?.slides?.length ?? 0))}
          sx={{
            flexShrink: 0,
            width: '100%',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            bgcolor: isExitActive ? '#3C59A266' : 'background.default',
            borderTop: `1px solid ${currentTheme.input.outlineColor}`,
            borderLeft: isExitActive
              ? '4px solid #007bff'
              : '4px solid transparent',
            '&:hover': {
              bgcolor: isExitActive ? '#3C59A266' : 'rgba(0, 123, 255, 0.08)',
            },
          }}
        >
          {/* Change typography to mimic tabs */}
          <Typography
            variant="h5"
            color="text.primary"
            align="center"
            sx={{
              opacity: isExitActive ? 1 : 0.6,
              transition: 'opacity 0.2s',
            }}
          >
            Exit
          </Typography>
        </Box>
      )}
    </Box>
  );
}

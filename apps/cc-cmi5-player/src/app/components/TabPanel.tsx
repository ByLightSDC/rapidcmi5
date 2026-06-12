import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { auJsonSel, courseAUProgressSel } from '../redux/auReducer';
import { activeTabSel, setActiveTab } from '../redux/navigationReducer';
import ProgressBar from './ProgressBar';
import { CustomTheme } from '../styles/createPalette';
import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';
import { useTabStyles } from './useTabStyles';
import CloseIcon from '@mui/icons-material/Close';
import { CoursePresentationContext } from '@rapid-cmi5/ui';

export default function TabPanel() {
  const auJson = useSelector(auJsonSel);
  const { logoPath } = useContext(CoursePresentationContext);

  const dispatch = useDispatch();
  const activeTab = useSelector(activeTabSel);
  const courseAUProgress = useSelector(courseAUProgressSel);
  const currentTheme: CustomTheme = useTheme();

  // Track whether the Exit tab in the list is currently visible in the scroll container.
  // Only show the pinned Exit button at the bottom when the real one has scrolled out of view.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const exitTabRef = useRef<HTMLDivElement>(null);
  const [isExitTabVisible, setIsExitTabVisible] = useState(true);

  const iconDimension = '20px';
  const auLogoWidth = '200px';

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

  // Helper function to get status icon for accessibility
  const getSlideStatusIcon = (slideIndex: number) => {
    const status = getSlideStatus(slideIndex);

    if (status.failed) {
      return (
        <Box
          sx={{
            borderRadius: '12px',
            height: iconDimension,
            width: iconDimension,
            backgroundColor: currentTheme.nav.deselectedTabText,
          }}
        >
          <CloseIcon
            sx={{
              color: currentTheme.nav.shouldColorTabIndicator
                ? currentTheme.palette.error.main
                : currentTheme.palette.primary.contrastText,
              fontSize: iconDimension,
              height: iconDimension,
              width: iconDimension,
            }}
          />
        </Box>
      );
    } else if (status.passed && !status.failed) {
      return (
        <Box
          sx={{
            borderRadius: '12px',
            height: iconDimension,
            width: iconDimension,
            backgroundColor: currentTheme.nav.deselectedTabText,
          }}
        >
          <Check
            style={{
              color: currentTheme.nav.shouldColorTabIndicator
                ? currentTheme.palette.success.main
                : currentTheme.palette.primary.contrastText,
              fontSize: iconDimension,
              height: iconDimension,
              width: iconDimension,
            }}
          />
        </Box>
      );
    }
    return null; // No icon for incomplete slides
  };

  const {
    baseTabStyle,
    baseTabsStyle,
    selectedTextIconColor,
    deselectedTextIconColor,
  } = useTabStyles(activeTab, getSlideStatus);

  const isExitActive = activeTab === auJson?.slides?.length;

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

  useEffect(() => {
    //REF
  }, [currentTheme.palette.mode]);

  return (
    <Box
      sx={{
        maxWidth: '260px',
        width: '100%',
        height: '100vh',
        //left panel background
        bgcolor: currentTheme.nav.tabPanel,
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
          marginRight: '34px',
        }}
      >
        {logoPath && (
          <img
            alt="Course or Logo"
            width={auLogoWidth}
            style={{
              padding: '16px',
              paddingBottom: '0px',
            }}
            src={logoPath}
          />
        )}
      </Box>
      {/* Progress bar — fixed, never scrolls */}
      <Box sx={{ flexShrink: 0, width: '100%' }}>
        <ProgressBar
          fillColor={currentTheme.nav.progressBarFill}
          sxProps={{
            borderRadius: 5,
            height: 10,
            backgroundColor: currentTheme.nav.progressBar,
          }}
          textProps={{ color: currentTheme.nav.deselectedTabText }}
        />
      </Box>
      {/* Slide list — scrolls when there are many slides */}
      <Box
        ref={scrollContainerRef}
        sx={{ flex: 1, minHeight: 0, width: '100%', overflowY: 'auto' }}
      >
        <Divider />
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={activeTab}
          onChange={tabClicked}
          scrollButtons={false}
          aria-label="Slide Navigation Menu"
          sx={baseTabsStyle}
          textColor="inherit"
        >
          {auJson?.slides?.map((slide, index) => (
            <Tab
              sx={baseTabStyle}
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
                    component="span"
                    color={
                      index === activeTab
                        ? selectedTextIconColor
                        : deselectedTextIconColor
                    }
                    sx={{
                      flexGrow: 1,
                      fontSize: '16px',
                      fontWeight: 'bold',
                      lineHeight: 1.1,
                    }}
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
            sx={baseTabStyle}
            label={
              <Typography
                variant="h5"
                color={
                  isExitActive ? selectedTextIconColor : deselectedTextIconColor
                }
                align="center"
              >
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
          sx={{ ...baseTabStyle, cursor: 'pointer' }}
        >
          {/* Change typography to mimic tabs */}
          <Typography
            variant="h5"
            align="center"
            color={
              isExitActive ? selectedTextIconColor : deselectedTextIconColor
            }
          >
            Exit
          </Typography>
        </Box>
      )}
    </Box>
  );
}

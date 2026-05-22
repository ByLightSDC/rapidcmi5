import { useTheme } from '@mui/material';
import { CustomTheme } from '../styles/createPalette';
import { useMemo } from 'react';

export const useTabStyles = (
  activeTab: number,
  getSlideStatus: (slideIndex: number) => {
    viewed: boolean;
    completed: boolean;
    passed: boolean;
    failed: boolean;
  },
) => {
  const currentTheme: CustomTheme = useTheme();

  const selectedColor = useMemo(
    () => currentTheme.nav.selectedTab,
    [currentTheme.nav.selectedTab],
  );

  const deselectedColor = useMemo(
    () => currentTheme.nav.deselectedTab,
    [currentTheme.nav.deselectedTab],
  );

  const selectedTextIconColor = useMemo(
    () => currentTheme.nav.selectedTabText,
    [currentTheme.nav.selectedTabText],
  );

  const deselectedTextIconColor = useMemo(
    () => currentTheme.nav.deselectedTabText,
    [currentTheme.nav.deselectedTabText],
  );

  // Helper function to get the color for the active tab indicator (overrides MUI default)
  const getActiveTabIndicatorColor = () => {
    if (!currentTheme.nav.shouldColorTabIndicator) {
     return currentTheme.nav.currentTabIndicator;
    }

    const status = getSlideStatus(activeTab);

    let color;
    if (status.failed) {
      color = currentTheme.palette.error.main; // Red indicator for failed active slide
    } else if (status.passed && !status.failed) {
      color = currentTheme.palette.success.main; // Green indicator for passed active slide (MUI success color)
    } else {
      color = currentTheme.palette.primary.main; //'#007bff'; // Blue indicator for active slide with no status
    }

    return color;
  };

  const baseTabsStyle = {
    width: '100%',
    backgroundColor: deselectedColor, //works tints 'orange',
    bgcolor: deselectedColor, //'background.default', //this gets applied  as a tint
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
      backgroundColor: deselectedColor, //'background.default',
      borderStyle: 'solid',

      borderColor: currentTheme.nav.deselectedTabBorder, //currentTheme.input.outlineColor,

      borderRadius: 0,
      borderWidth: 1,
    },
    '& .MuiTab-root.Mui-selected': {
      fontWeight: 'bold',
      backgroundColor: selectedColor,
      borderStyle: 'none',
      borderColor: currentTheme.nav.selectedTabBorder,
    },
  };

  const baseTabStyle = {
    width: '100%',
    position: 'relative',
    minHeight: '48px',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    display: 'flex',
    opacity: 1,
    '&:not(.Mui-selected)': {
      opacity: 0.75,
    },
    backgroundColor: deselectedColor,
    borderStyle: 'solid',
    '&:hover': {
      backgroundColor: currentTheme.nav.tabHover,
      color: '#FFFFFF',
      cursor: 'pointer',
      '&:not(.Mui-selected)': {
        opacity: 1,
      },
    },
  };

  // Helper function to get right border for each slide's pass/fail status
  const getSlideRightBorder = (slideIndex: number) => {
    // if (!currentTheme.nav.shouldColorTabIndicator) {
    //   return currentTheme.palette.primary.main;
    // }

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

  return {
    baseTabStyle,
    baseTabsStyle,
    selectedColor,
    deselectedColor,
    selectedTextIconColor,
    deselectedTextIconColor,
  };
};

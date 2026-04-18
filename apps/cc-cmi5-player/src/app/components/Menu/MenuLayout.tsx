/* eslint-disable react/jsx-no-useless-fragment */
import { DRAWER_WIDTH } from '../ContentLayout';
import TabPanel from '../TabPanel';
import Drawer from '@mui/material/Drawer';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Box, useTheme } from '@mui/material';
import { auJsonSel } from '../../redux/auReducer';
import { activeTabSel } from '../../redux/navigationReducer';
import { useDispatch, useSelector } from 'react-redux';
import RC5Player from '../player/RC5Player';
import ExitSlide from '../ExitSlide';
import ScenarioWrapper from '../scenario/ScenarioWrapper';
import { TeamScenarioContextProvider } from '../team-consoles/TeamScenarioContext';
import { useCMI5Session } from '../../hooks/useCMI5Session';
import {
  config,
  dividerColor,
  setDividerColor,
  setIconColor,
  maxSlideWidth$,
} from '@rapid-cmi5/ui';
import { CustomTheme } from '../../styles/createPalette';
import LessonToolbar from './LessonToolbar';

export default function MenuLayout() {
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(true);
  const [isSplitPanelShown, setIsSplitPanelShown] = useState(false);
  const currentTheme: CustomTheme = useTheme();
  const dispatch = useDispatch();
  const auJson = useSelector(auJsonSel);
  const activeTab = useSelector(activeTabSel);
  const isExitSlide = activeTab === auJson?.slides?.length;
  const themedDividerColor = useSelector(dividerColor);
  const muiTheme = useTheme();
  const { palette } = muiTheme;
  const slideRef = useRef<HTMLDivElement>(null);

  useCMI5Session();

  const handleDrawerOpen = () => setIsMenuDrawerOpen(true);
  const handleDrawerClose = () => setIsMenuDrawerOpen(false);

  const handleSplitOn = () => {
    setIsSplitPanelShown(true);
    if (isMenuDrawerOpen) handleDrawerClose();
  };

  const handleSplitOff = () => {
    setIsSplitPanelShown(false);
    if (!isMenuDrawerOpen) handleDrawerOpen();
  };

  useEffect(() => {
    if (currentTheme) {
      dispatch(setIconColor(currentTheme.button.iconColor));
      dispatch(setDividerColor(currentTheme.input.outlineColor || 'grey'));
    }
  }, [currentTheme, dispatch]);

  useLayoutEffect(() => {
    if (!slideRef.current) return;

    const measure = () => {
      if (slideRef.current) {
        const rect = slideRef.current.getBoundingClientRect();
        document.documentElement.style.setProperty('--panel-width', `${rect.left}px`);
        maxSlideWidth$.value = rect.width;
      }
    };

    const observer = new ResizeObserver(measure);
    observer.observe(slideRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Drawer
        sx={{
          width: isMenuDrawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            backgroundColor: 'background.default',
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            overflow: 'hidden',
          },
        }}
        variant="persistent"
        anchor="left"
        open={isMenuDrawerOpen}
      >
        <div role="navigation" aria-label="Slides">
          <TabPanel />
        </div>
      </Drawer>

      <PanelGroup direction="horizontal">
        <Panel defaultSize={45} minSize={5}>
          <Box
            ref={slideRef}
            sx={{
              backgroundColor: palette.background.paper,
              height: '100%',
              width: '100%',
              overflow: 'auto',
            }}
          >
            <LessonToolbar
              isMenuDrawerOpen={isMenuDrawerOpen}
              isSplitPanelShown={isSplitPanelShown}
              onDrawerOpen={handleDrawerOpen}
              onDrawerClose={handleDrawerClose}
              onSplitOn={handleSplitOn}
              onSplitOff={handleSplitOff}
            />

            <>
              {isExitSlide && <ExitSlide />}
              {!isExitSlide && !config.CMI5_SSO_ENABLED && (
                <ScenarioWrapper>
                  <RC5Player />
                </ScenarioWrapper>
              )}
              {!isExitSlide && config.CMI5_SSO_ENABLED && (
                <TeamScenarioContextProvider isEnabled={true}>
                  <RC5Player />
                </TeamScenarioContextProvider>
              )}
            </>
          </Box>
        </Panel>
        {isSplitPanelShown && (
          <>
            <PanelResizeHandle style={{ width: 4, backgroundColor: themedDividerColor }} />
            <Panel />
          </>
        )}
      </PanelGroup>
    </>
  );
}

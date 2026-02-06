import '@mdxeditor/editor/style.css';

/**MUI */
import { Divider, Stack } from '@mui/material';

/** Data */
import { LessonDrawer } from './drawers/LessonDrawer';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { NavViewMenu } from './menu/NavViewMenu';
import { useDispatch, useSelector } from 'react-redux';
import {
  changeViewMode,
  currentViewMode,
} from '../../redux/courseBuilderReducer';
import { ViewModeEnum } from '../course-builder/CourseBuilderTypes';

import { FileDrawer } from './drawers/FileDrawer';
import RC5FileEditor from './editors/RC5FileEditor';
import RC5VisualEditor from './editors/RC5VisualEditor';
import RC5GitEditor from './editors/RC5GitEditor';
import { GitDrawer } from './drawers/GitDrawer';
import { SlideMenu } from './menu/ArchiveSlideMenu';
import { dividerColor } from '@rapid-cmi5/ui';
import WelcomePage from './ProjectSelection/SelectProject';
import { useEffect } from 'react';

/**
 * RapidCMI5 Course Editor Landing
 * View has menu to navigate 3 views
 *
 * @returns
 */
export function Landing({ showHomeButton }: { showHomeButton?: boolean }) {
  const viewMode = useSelector(currentViewMode);
  const themedDividerColor = useSelector(dividerColor);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(changeViewMode(ViewModeEnum.RepoSelector));
  }, []);

  return (
    <>
      {viewMode === ViewModeEnum.RepoSelector ? (
        <WelcomePage
          setRepoSelected={() => {
            dispatch(changeViewMode(ViewModeEnum.Designer));
          }}
        />
      ) : (
        <Stack
          direction="row"
          sx={{
            width: '100%',
            height: '100%',
            minHeight: 0,
          }}
        >
          <NavViewMenu showHomeButton={showHomeButton} />
          <Divider orientation="vertical" />
          <PanelGroup direction="horizontal">
            <Panel defaultSize={24} minSize={10}>
              {viewMode === ViewModeEnum.Designer && <LessonDrawer />}
              {viewMode === ViewModeEnum.CodeEditor && <FileDrawer />}
              {viewMode === ViewModeEnum.GitEditor && <GitDrawer />}
            </Panel>

            <PanelResizeHandle
              style={{
                backgroundColor: themedDividerColor,
                width: 4,
              }}
            />
            <Panel>
              {viewMode === ViewModeEnum.Designer && (
                <>
                  {/* <SlideMenu /> */}
                  <RC5VisualEditor />
                </>
              )}
              {viewMode === ViewModeEnum.CodeEditor && <RC5FileEditor />}
              {viewMode === ViewModeEnum.GitEditor && <RC5GitEditor />}
            </Panel>
          </PanelGroup>
        </Stack>
      )}
    </>
  );
}

export default Landing;

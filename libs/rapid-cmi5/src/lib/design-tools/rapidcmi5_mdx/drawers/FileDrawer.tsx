import { useContext, useEffect, useState } from 'react';

/* MUI */
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import DirectoryTree from '../../course-builder/GitViewer/Components/SelectedRepo/DirectoryTree';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';

import { filterTreePath } from '../../course-builder/GitViewer/Components/SelectedRepo/treeHelpers';
import { useCourseData } from '../data-hooks/useCourseData';
import FilterListIcon from '@mui/icons-material/FilterList';
import ChangeRepoExpander from './components/ChangeRepoExpander';
import { RepoState } from '../../../redux/repoManagerReducer';
import { RootState } from '../../../redux/store';
import { useSelector } from 'react-redux';
import SectionLabel from '../../../shared/SectionLabel';
import { ButtonTooltip } from '@rapid-cmi5/ui/api/hooks';

export const FileDrawer = () => {
  const {
    currentCourse,
    currentRepo,
    directoryTree,
    handleChangeRepo,
    handleChangeFileSystem,
    isElectron,
  } = useContext(GitContext);

  const { fileSystemType, availableRepos }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );

  const { currentAuIndex, currentBlockIndex } = useCourseData();

  const [selectedCourseFilter, setSelectectedCourseFilter] = useState<string>();
  const [selectedLessonFilter, setSelectectedLessonFilter] = useState<string>();
  const [showFilters, setShowFilters] = useState(false);
  const [curDirectoryTree, setCurDirectoryTree] = useState(directoryTree);

  useEffect(() => {
    const getCmi5 = async () => {
      if (!currentRepo) return;
      if (!selectedCourseFilter) {
        setCurDirectoryTree(directoryTree);
        return;
      }

      const filter = selectedLessonFilter || selectedCourseFilter;
      setCurDirectoryTree(filterTreePath(filter, directoryTree));
    };
    getCmi5();
  }, [selectedCourseFilter, selectedLessonFilter, currentRepo, directoryTree]);

  // useEffect(() => {
  //   if (!currentCourse) {
  //     handleAutoSelectCourse();
  //   }
  // }, []);

  const filterCount =
    (selectedLessonFilter ? 1 : 0) + (selectedCourseFilter ? 1 : 0);
  return (
    <Stack
      data-testid="file-drawer"
      spacing={2.5}
      sx={{
        backgroundColor: 'background.default',
        height: '100%',
        padding: 1,
      }}
    >
      <Stack spacing={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>
            COURSE FILES
          </Typography>

          <Stack direction="row">
            {filterCount > 0 && (
              <ButtonTooltip
                id="current-filters"
                tooltipProps={{
                  placement: 'bottom-end',
                }}
                title=""
              >
                <Typography
                  align="center"
                  variant="caption"
                  sx={{
                    borderColor: 'primary.main',
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'inline-block',
                    width: '18px',
                    height: '18px',
                    cursor: 'default',
                  }}
                >
                  {filterCount}
                </Typography>
              </ButtonTooltip>
            )}

            <Tooltip title={`${showFilters ? 'Hide' : 'Show'} Filters`}>
              <IconButton
                onClick={() => setShowFilters((prev) => !prev)}
                size="small"
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <ChangeRepoExpander
          isExpanded={true}
          isElectron={isElectron}
          availableRepos={availableRepos}
          currentRepo={currentRepo}
          fileSystemType={fileSystemType}
          handleChangeFileSystem={handleChangeFileSystem}
          handleChangeRepo={handleChangeRepo}
        />
        {showFilters && (
          <Stack direction="column" spacing={1}>
            <Stack direction="row" spacing={0} alignItems="center">
              <Checkbox
                sx={{ color: 'primary.main', padding: 0, margin: 0 }}
                id="show-course-files-only"
                aria-label="Show Course Files Only"
                data-testid="show-course-files-only"
                name="show-course-files-only"
                checked={!!selectedCourseFilter}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectectedCourseFilter(currentCourse?.basePath);
                  } else {
                    setCurDirectoryTree(directoryTree);
                    setSelectectedCourseFilter(undefined);
                    setSelectectedLessonFilter(undefined);
                  }
                }}
                required={false} //Force required to false to avoid native validation message on hover
              />
              <SectionLabel
                label="Show Course
              Files Only"
                variant="caption"
                sxProps={{ fontWeight: 'bold', lineHeight: 1 }}
              />
            </Stack>
            {selectedCourseFilter && (
              <Stack direction="row" spacing={0} alignItems="center">
                <Checkbox
                  sx={{ color: 'primary.main', padding: 0, margin: 0 }}
                  id="show-lesson-files-only"
                  aria-label="Show Lesson Files Only"
                  data-testid="show-lesson-files-only"
                  name="show-lesson-files-only"
                  checked={!!selectedLessonFilter}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const auPath =
                        currentCourse?.courseData?.blocks[currentBlockIndex]
                          ?.aus?.[currentAuIndex]?.dirPath;
                      if (auPath) {
                        setSelectectedLessonFilter(auPath);
                      }
                    } else {
                      setSelectectedLessonFilter(undefined);
                    }
                  }}
                  required={false} //Force required to false to avoid native validation message on hover
                />
                <SectionLabel
                  label="Show Lesson Files Only"
                  variant="caption"
                  sxProps={{ fontWeight: 'bold', lineHeight: 1 }}
                />
              </Stack>
            )}
          </Stack>
        )}
      </Stack>

      <Box
        sx={{
          width: '100%',
          height: '100%',
          overflowY: 'auto',
        }}
      >
        {currentRepo && (
          <DirectoryTree
            currentRepo={currentRepo}
            directoryTree={curDirectoryTree}
          />
        )}
      </Box>
    </Stack>
  );
};

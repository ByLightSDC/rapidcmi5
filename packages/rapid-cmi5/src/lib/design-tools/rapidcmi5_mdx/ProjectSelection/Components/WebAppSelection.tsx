import { Box, Container } from '@mui/material';
import { DirMeta } from '../../../course-builder/GitViewer/utils/fileSystem';
import CloneLoadingOverlay from './LoadingOverlay';
import ProductionModeSelection from './ProductionModeSelection';
import RecentProjectSelection from './RecentProjectSelection';
import SandBoxSelection from './SandBoxSelection';
import { LoadingState } from 'packages/rapid-cmi5/src/lib/redux/repoManagerReducer';
import DesktopDownload from './DesktopDownloader';

interface OptionDocumentation {
  title: string;
  content: string;
}

export default function WebAppSelection({
  openLocalFolderAndSet,
  openLocalRecentProject,
  handleCreateRepo,
  handleOpenSandbox,
  recentProjects,
  handleCloneRepo,
  handleShowDocumentation,
}: {
  openLocalFolderAndSet: () => Promise<void>;
  openLocalRecentProject: (id: string) => Promise<void>;
  handleCreateRepo: () => void;
  handleOpenSandbox: () => Promise<void>;
  recentProjects: DirMeta[];
  handleShowDocumentation: (doc: OptionDocumentation) => void;
  handleCloneRepo: () => void;
}) {
  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateRows: { xs: 'auto', md: '1fr auto' },
            alignContent: 'start',
            gap: 2,
          }}
        >
          <ProductionModeSelection
            openLocalFolder={openLocalFolderAndSet}
            cloneRepo={handleCloneRepo}
            createRepo={handleCreateRepo}
            onShowDocumentation={handleShowDocumentation}
          />
          <SandBoxSelection openSandbox={handleOpenSandbox} />
        </Box>

        <RecentProjectSelection
          recentProjects={recentProjects}
          openRecentProject={openLocalRecentProject}
        />
      </Box>

      {/* <DesktopDownload
        baseUrl="https://github.com/ByLightSDC/rapidcmi5/releases/download"
        version="v0.7.0"
        macName="RapidCMI5-0.7.0"
        windowsName="RapidCMI5.Setup.0.7.0"
        linuxName="RapidCMI5-0.7.0"
        macArmName="RapidCMI5-0.7.0-arm64"
      /> */}
    </>
  );
}

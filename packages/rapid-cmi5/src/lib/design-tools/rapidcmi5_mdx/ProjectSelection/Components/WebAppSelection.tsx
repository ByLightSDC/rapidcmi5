import { Box } from '@mui/material';
import ProductionModeSelection from './ProductionModeSelection';
import RecentProjectSelection from './RecentProjectSelection';
import SandBoxSelection from './SandBoxSelection';
import { DirMeta } from '@rapid-cmi5/cmi5-build-common';


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
  isSandboxLaunching = false,
  removeLocalRecentProject,
}: {
  openLocalFolderAndSet: () => Promise<void>;
  openLocalRecentProject: (id: string) => Promise<void>;
  removeLocalRecentProject: (ids: string[]) => Promise<void>;
  handleCreateRepo: () => void;
  handleOpenSandbox: () => Promise<void>;
  recentProjects: DirMeta[];

  handleShowDocumentation: (doc: OptionDocumentation) => void;
  handleCloneRepo: () => void;
  isSandboxLaunching?: boolean;
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
            isDisabled={isSandboxLaunching}
          />
          <SandBoxSelection
            openSandbox={handleOpenSandbox}
            isLaunching={isSandboxLaunching}
          />
        </Box>

        <RecentProjectSelection
          recentProjects={recentProjects}
          openRecentProject={openLocalRecentProject}
          removeRecentProject={removeLocalRecentProject}
          isDisabled={isSandboxLaunching}
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

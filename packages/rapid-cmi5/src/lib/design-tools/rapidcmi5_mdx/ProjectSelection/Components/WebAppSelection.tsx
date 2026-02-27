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
  onOpenLocalFolder,
  onOpenRecentProject,
  onCreateRepo,
  onOpenSandbox,
  recentProjects,
  onCloneRepo,
  onShowDocumentation,
  isSandboxLaunching = false,
  onRemoveRecentProject,
}: {
  onOpenLocalFolder: () => Promise<void>;
  onOpenRecentProject: (id: string) => Promise<void>;
  onRemoveRecentProject: (ids: string[]) => Promise<void>;
  onCreateRepo: () => void;
  onOpenSandbox: () => Promise<void>;
  recentProjects: DirMeta[];
  onShowDocumentation: (doc: OptionDocumentation) => void;
  onCloneRepo: () => void;
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
            openLocalFolder={onOpenLocalFolder}
            cloneRepo={onCloneRepo}
            createRepo={onCreateRepo}
            onShowDocumentation={onShowDocumentation}
            isDisabled={isSandboxLaunching}
          />
          <SandBoxSelection
            openSandbox={onOpenSandbox}
            isLaunching={isSandboxLaunching}
          />
        </Box>

        <RecentProjectSelection
          recentProjects={recentProjects}
          onOpenRecentProject={onOpenRecentProject}
          onRemoveRecentProject={onRemoveRecentProject}
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

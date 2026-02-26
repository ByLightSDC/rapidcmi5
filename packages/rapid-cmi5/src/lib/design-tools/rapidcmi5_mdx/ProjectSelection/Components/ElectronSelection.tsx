import { Box } from '@mui/material';
import ProductionModeSelection from './ProductionModeSelection';
import RecentProjectSelection from './RecentProjectSelection';
import { DirMeta } from '@rapid-cmi5/cmi5-build-common';

interface OptionDocumentation {
  title: string;
  content: string;
}

export default function ElectronAppSelection({
  openLocalFolderAndSet,
  openLocalRecentProject,
  removeLocalRecentProject,
  handleCreateRepo,
  recentProjects,
  handleCloneRepo,
  handleShowDocumentation,
}: {
  openLocalFolderAndSet: () => Promise<void>;
  openLocalRecentProject: (id: string) => Promise<void>;
  removeLocalRecentProject: (id: string[]) => Promise<void>;
  handleCreateRepo: () => void;
  recentProjects: DirMeta[];
  handleShowDocumentation: (doc: OptionDocumentation) => void;
  handleCloneRepo: () => void;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gridAutoRows: { md: '1fr' },
        gap: 2,
        flex: 1,
      }}
    >
      <ProductionModeSelection
        openLocalFolder={openLocalFolderAndSet}
        cloneRepo={handleCloneRepo}
        createRepo={handleCreateRepo}
        onShowDocumentation={handleShowDocumentation}
        isElectron={true}
      />

      <RecentProjectSelection
        recentProjects={recentProjects}
        openRecentProject={openLocalRecentProject}
        removeRecentProject={removeLocalRecentProject}
      />
    </Box>
  );
}

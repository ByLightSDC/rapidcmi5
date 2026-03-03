import { Box } from '@mui/material';
import ProductionModeSelection from './ProductionModeSelection';
import RecentProjectSelection from './RecentProjectSelection';
import { DirMeta } from '@rapid-cmi5/cmi5-build-common';

interface OptionDocumentation {
  title: string;
  content: string;
}

export default function ElectronAppSelection({
  onOpenLocalFolder,
  onOpenRecentProject,
  onCreateRepo,
  recentProjects,
  onCloneRepo,
  onShowDocumentation,
}: {
  onOpenLocalFolder: () => Promise<void>;
  onOpenRecentProject: (id: string) => Promise<void>;
  onCreateRepo: () => void;
  recentProjects: DirMeta[];
  onShowDocumentation: (doc: OptionDocumentation) => void;
  onCloneRepo: () => void;
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
        openLocalFolder={onOpenLocalFolder}
        cloneRepo={onCloneRepo}
        createRepo={onCreateRepo}
        onShowDocumentation={onShowDocumentation}
        isElectron={true}
      />

      <RecentProjectSelection
        recentProjects={recentProjects}
        onOpenRecentProject={onOpenRecentProject}
      />
    </Box>
  );
}

import { useContext, useEffect, useState } from 'react';
import { alpha, Box, Container, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import SandBoxSelection from './Components/SandBoxSelection';
import RecentProjectSelection from './Components/RecentProjectSelection';
import ProductionModeSelection from './Components/ProductionModeSelection';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';
import { DirMeta } from '../../course-builder/GitViewer/utils/fileSystem';
import DocumentationDialog from './Dialogs/DocumentationDialog';
import CloneLoadingOverlay from './Components/LoadingOverlay';
import { useRC5Prompts } from '../modals/useRC5Prompts';
import { RepoState } from '../../../redux/repoManagerReducer';
import { RootState } from '../../../redux/store';

interface OptionDocumentation {
  title: string;
  content: string;
}

export default function WelcomePage({
  setRepoSelected,
}: {
  setRepoSelected: () => void;
}) {
  const theme = useTheme();
  const { palette } = theme;

  const { getLocalFolders, openSandbox, createNewRepo, openLocalRepo } =
    useContext(GitContext);
  const { promptCloneRepo, promptCreateLocalRepo } = useRC5Prompts();
  const [recentProjects, setRecentProjects] = useState<DirMeta[]>([]);
  console.log('recentProjects', recentProjects);

  const { loadingState }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );

  const backgroundGradient = `linear-gradient(
  135deg,
  ${palette.background.default} 0%,
  ${palette.background.paper} 50%,
  ${alpha(palette.background.default, 0.85)} 100%
)`;

  const radialGradients = `
  radial-gradient(
    circle at 20% 30%,
    ${alpha(palette.primary.main, 0.35)} 0%,
    transparent 70%
  ),
  radial-gradient(
    circle at 80% 70%,
    ${alpha(palette.primary.main, 0.3)} 0%,
    transparent 60%
  )
`;
  const populateFolders = async () => {
    setRecentProjects(await getLocalFolders());
  };

  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const handleShowDocumentation = (doc: OptionDocumentation) => {
    setCurrentDoc(doc);
    setDocDialogOpen(true);
  };

  const handleCloseDocumentation = () => {
    setDocDialogOpen(false);
  };

  const [currentDoc, setCurrentDoc] = useState<OptionDocumentation | null>(
    null,
  );

  useEffect(() => {
    populateFolders();
  }, []);

  const openLocalFolderAndSet = async () => {
    await openLocalRepo();

    setRepoSelected();
  };

  const openLocalRecentProject = async (id: string) => {
    console.log('opening with ', id);
    await openLocalRepo(id);
    setRepoSelected();
  };

  const createRepo = async () => {
    promptCreateLocalRepo();
  };

  const openSandboxt = async () => {
    await openSandbox();
    setRepoSelected();
  };

  const cloneRepo = async () => {
    promptCloneRepo();
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        background: backgroundGradient,
        position: 'relative',
        overflow: 'auto',
      }}
    >
      <Box
        sx={{
          height: '100vh',
          width: '100%',
          background: radialGradients,
          position: 'relative',
          overflow: 'auto',
        }}
      >
        <Container sx={{ py: 3, position: 'relative', zIndex: 1 }}>
          {/* Main Grid Layout */}
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
                cloneRepo={cloneRepo}
                createRepo={createRepo}
                onShowDocumentation={handleShowDocumentation}
              />
              <SandBoxSelection openSandbox={openSandboxt} />
            </Box>

            <RecentProjectSelection
              recentProjects={recentProjects}
              openRecentProject={openLocalRecentProject}
            />
          </Box>
          <CloneLoadingOverlay loadingVariant={loadingState} />

          <DocumentationDialog
            open={docDialogOpen}
            onClose={handleCloseDocumentation}
            title={currentDoc?.title || ''}
            content={currentDoc?.content || ''}
          />
        </Container>

        {/* Global Styles for Animations */}
        <style>
          {`
          @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
        </style>
      </Box>
    </Box>
  );
}

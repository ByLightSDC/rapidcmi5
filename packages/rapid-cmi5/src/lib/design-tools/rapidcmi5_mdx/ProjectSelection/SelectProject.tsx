import { useContext, useEffect, useState } from 'react';
import { alpha, Box, Container, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';
import { DirMeta } from '../../course-builder/GitViewer/utils/fileSystem';
import DocumentationDialog from './Dialogs/DocumentationDialog';
import { useRC5Prompts } from '../modals/useRC5Prompts';
import { RepoState } from '../../../redux/repoManagerReducer';
import { RootState } from '../../../redux/store';
import WebAppSelection from './Components/WebAppSelection';
import ElectronAppSelection from './Components/ElectronSelection';
import CloneLoadingOverlay from './Components/LoadingOverlay';
import { useToaster } from '@rapid-cmi5/ui';

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
  const toast = useToaster();

  const { getLocalFolders, openSandbox, openLocalRepo, isElectron } =
    useContext(GitContext);
  const { promptCloneRepo, promptCreateLocalRepo } = useRC5Prompts();
  const [recentProjects, setRecentProjects] = useState<DirMeta[]>([]);
  const [isSandboxLaunching, setIsSandboxLaunching] = useState(false);

  const { loadingState }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );

  const openLocalFolderWithToast = async (id?: string) => {
    try {
      await openLocalRepo(id);

      toast({
        message: 'Repository opened successfully.',
        severity: 'success',
      });
    } catch (e: any) {
      const msg =
        e?.message || e?.name || 'Failed to open repository. Please try again.';

      toast({
        message: `Open repository failed: ${msg}`,
        severity: 'error',
      });
    }
  };

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
    await openLocalRepo(id);
    setRepoSelected();
  };

  const handleOpenSandbox = async () => {
    if (isSandboxLaunching) return;
    setIsSandboxLaunching(true);
    try {
      await openSandbox();
      setRepoSelected();
    } finally {
      setIsSandboxLaunching(false);
    }
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
        <Container
          sx={{
            py: 3,
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            mb: 3,
          }}
        >
          {isElectron ? (
            <ElectronAppSelection
              recentProjects={recentProjects}
              handleShowDocumentation={handleShowDocumentation}
              handleCloneRepo={promptCloneRepo}
              handleCreateRepo={promptCreateLocalRepo}
              openLocalFolderAndSet={openLocalFolderWithToast}
              openLocalRecentProject={openLocalRecentProject}
            />
          ) : (
            <WebAppSelection
              handleOpenSandbox={handleOpenSandbox}
              isSandboxLaunching={isSandboxLaunching}
              recentProjects={recentProjects}
              handleShowDocumentation={handleShowDocumentation}
              handleCloneRepo={promptCloneRepo}
              handleCreateRepo={promptCreateLocalRepo}
              openLocalFolderAndSet={openLocalFolderWithToast}
              openLocalRecentProject={openLocalRecentProject}
            />
          )}
        </Container>
        <CloneLoadingOverlay
          loadingVariant={loadingState}
          forceShow={isSandboxLaunching}
          overrideMessage="Launching sandbox..."
        />

        <DocumentationDialog
          open={docDialogOpen}
          onClose={handleCloseDocumentation}
          title={currentDoc?.title || ''}
          content={currentDoc?.content || ''}
        />

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

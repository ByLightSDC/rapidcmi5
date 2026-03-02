import { useContext, useEffect, useState } from 'react';
import { alpha, Box, Container, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';
import DocumentationDialog from './Dialogs/DocumentationDialog';
import { useRC5Prompts } from '../modals/useRC5Prompts';
import { RepoState } from '../../../redux/repoManagerReducer';
import { RootState } from '../../../redux/store';
import WebAppSelection from './Components/WebAppSelection';
import ElectronAppSelection from './Components/ElectronSelection';
import CloneLoadingOverlay from './Components/LoadingOverlay';
import { useToaster } from '@rapid-cmi5/ui';
import { DirMeta } from '@rapid-cmi5/cmi5-build-common';

interface OptionDocumentation {
  title: string;
  content: string;
}

export default function SelectProjectHomePage({}: {}) {
  const [recentProjects, setRecentProjects] = useState<DirMeta[]>([]);
  const [isSandboxLaunching, setIsSandboxLaunching] = useState(false);
  const [docDialogOpen, setDocDialogOpen] = useState(false);

  const theme = useTheme();
  const { palette } = theme;

  const displayToaster = useToaster();

  const {
    getLocalFolders,
    openSandbox,
    openLocalRepo,
    isElectron,
    deleteRecentProject,
  } = useContext(GitContext);

  const { promptCloneRepo, promptCreateLocalRepo } = useRC5Prompts();

  const { loadingState }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );

  const handleOpenLocalFolder = async (id?: string) => {
    try {
      await openLocalRepo(id);

      displayToaster({
        message: 'Repository opened successfully.',
        severity: 'success',
        autoHideDuration: 3000,
      });
    } catch (e: any) {
      const msg =
        e?.message || e?.name || 'Failed to open repository. Please try again.';

      displayToaster({
        message: `Open repository failed: ${msg}`,
        severity: 'error',
        autoHideDuration: 8000,
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

  const populateRecentProjects = async () => {
    setRecentProjects(await getLocalFolders());
  };

  useEffect(() => {
    populateRecentProjects();
  }, []);

  const removeRecentProjects = async (ids: string[]) => {
    if (!ids?.length) return;

    for (const id of ids) {
      await deleteRecentProject(id);
    }

    displayToaster({
      message:
        ids.length === 1
          ? `Removed project from your recents`
          : `Removed ${ids.length} projects from your recents`,
      severity: 'success',
      autoHideDuration: 3000,
    });

    populateRecentProjects();
  };

  const handleOpenRecentProject = async (id: string) => {
    try {
      await openLocalRepo(id);

      displayToaster({
        message: 'Repository opened successfully.',
        severity: 'success',
        autoHideDuration: 3000,
      });
    } catch (e: any) {
      const msg =
        e?.message ||
        e?.name ||
        'Failed to open repository. Removing from recents.';

      await deleteRecentProject(id);
      await populateRecentProjects();
      displayToaster({
        message: `Project folder has been moved or deleted: ${msg}`,
        severity: 'error',
        autoHideDuration: 8000,
      });
    }
  };

  const handleOpenSandbox = async () => {
    if (isSandboxLaunching) return;
    setIsSandboxLaunching(true);
    try {
      await openSandbox();
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
              onShowDocumentation={handleShowDocumentation}
              onCloneRepo={promptCloneRepo}
              onCreateRepo={promptCreateLocalRepo}
              onOpenLocalFolder={handleOpenLocalFolder}
              onOpenRecentProject={handleOpenRecentProject}
              onRemoveRecentProject={removeRecentProjects}
            />
          ) : (
            <WebAppSelection
              onOpenSandbox={handleOpenSandbox}
              isSandboxLaunching={isSandboxLaunching}
              recentProjects={recentProjects}
              onShowDocumentation={handleShowDocumentation}
              onCloneRepo={promptCloneRepo}
              onCreateRepo={promptCreateLocalRepo}
              onOpenLocalFolder={handleOpenLocalFolder}
              onOpenRecentProject={handleOpenRecentProject}
              onRemoveRecentProject={removeRecentProjects}
            />
          )}
        </Container>
        <CloneLoadingOverlay
          loadingVariant={loadingState}
          forceShow={isSandboxLaunching}
          overrideMessage={
            isSandboxLaunching ? 'Launching sandbox...' : undefined
          }
        />

        <DocumentationDialog
          open={docDialogOpen}
          onClose={handleCloseDocumentation}
          title={currentDoc?.title || ''}
          content={currentDoc?.content || ''}
        />
        <style>
          {`          
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

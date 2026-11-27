import { CreateNewFolder, FolderOpen } from '@mui/icons-material';
import { List, alpha, useTheme } from '@mui/material';
import {
  getSvgStyleIcon,
  StyleIconTypeEnum,
} from '../../styles/styleSvgConstants';
import OptionCard from './OptionCard';
import { GlassCard } from './GlassCard';

interface OptionDocumentation {
  title: string;
  content: string;
}

const documentation: Record<string, OptionDocumentation> = {
  clone: {
    title: 'Clone Git Repository',
    content: `Clone a remote Git repository using HTTPS with a personal access token (PAT)

## Steps:
1. Select a local folder where the repository will be cloned
2. Enter the repository URL (HTTPS format)
3. Provide your personal access token for authentication
4. The repository will be cloned to your selected location

**Note:** If you've already cloned a repository to your local computer, you can use the "Open Existing Repository" option instead to work with it directly

## Personal Access Token:
- **GitHub:** Settings → Developer settings → Personal access tokens
- **GitLab:** Preferences → Access Tokens
- Ensure your token has \`repo\` or \`read_repository\` permissions`,
  },
  open: {
    title: 'Open Existing Repository',
    content: `Open a Git repository that already exists on your local computer

## Requirements:
- The folder must contain a \`.rapid-git\` directory (browser) or \`.git\` directory (desktop)
- The repository should be properly initialized with Git

## This option is ideal when:
- You've already cloned a repository using Git CLI
- You've cloned using another Git client
- You want to work with an existing local repository

Browser projects use \`.rapid-git\`; the desktop app uses standard \`.git\`. Opening an existing desktop repository in the browser copies its Git history, staging state, and configuration into \`.rapid-git\` once. After that, browser and desktop Git history and settings are independent; use push and pull to share commits through your remote. Chromium now blocks browsers from creating \`.git\` and restricts writes inside it, which is why browser projects use the new folder name. When opening an older \`.git\` project in the browser, review the warning and choose Copy and Open to make the one-time copy, or Cancel to leave it unchanged.

To open a browser-only project on desktop, close it in the browser, back up the entire folder including hidden files, and rename \`.rapid-git\` to \`.git\` in your file manager before reopening it. Only rename when no \`.git\` folder already exists. Alternatively, push your browser commits and clone the remote into a separate desktop folder. Hooks and submodules are not supported in browser mode.`,
  },
  create: {
    title: 'Create New Repository',
    content: `Initialize a new Git repository in a fresh project folder

## Steps:
1. Select a parent directory on your computer
2. Specify a name for your new project folder
3. A new folder will be created with Git initialization
4. Start building your CMI5 course content

## This option will:
- Create a new directory with your specified name
- Initialize Git in the new directory
- Set up the basic CMI5 project structure
- Create an initial commit

**Perfect for starting a brand new CMI5 course from scratch**`,
  },
};

export type ProductionModeSelectionProps = {
  openLocalFolder: () => void;
  cloneRepo: () => void;
  onShowDocumentation?: (doc: OptionDocumentation) => void;
  createRepo: () => void;
  isElectron?: boolean;
  isDisabled?: boolean;
};

export default function ProductionModeSelection({
  openLocalFolder,
  cloneRepo,
  onShowDocumentation,
  createRepo,
  isElectron = false,
  isDisabled = false,
}: ProductionModeSelectionProps) {
  const handleShowDocs = (key: string) => {
    if (onShowDocumentation) {
      onShowDocumentation(documentation[key]);
    }
  };
  const theme = useTheme();
  const { palette } = theme;
  const ariaLabelId = 'production-mode';
  return (
    <GlassCard
      ariaLabelId={ariaLabelId}
      title="Production Mode"
      icon={<CreateNewFolder sx={{ color: 'white' }} />}
    >
      <nav aria-labelledby={ariaLabelId}>
        <List component="div" sx={{ p: 0, display: 'grid', gap: 1.5 }}>
          {/* Clone Git Repository */}
          <OptionCard
            data-testid="clone-repo-button"
            title={'Clone Git Repository'}
            handleSelect={cloneRepo}
            handleShowDocs={() => handleShowDocs('clone')}
            disabled={isDisabled}
            icon={
              getSvgStyleIcon(StyleIconTypeEnum.GIT, {
                fontSize: 'inherit',
                color: alpha(palette.primary.main, 0.9),
              }) || <></>
            }
            subText={<>Clone remote git repository to your desktop</>}
          />
          {/* Open Existing Repository */}
          {!isElectron && (
            <OptionCard
              data-testid="open-repo-button"
              title={'Open Existing Project'}
              handleSelect={() => openLocalFolder()}
              handleShowDocs={() => handleShowDocs('open')}
              disabled={isDisabled}
              icon={<FolderOpen />}
              subText={<>Select existing git project on your desktop</>}
            />
          )}
          {/* Open Existing Repository */}
          {isElectron && (
            <OptionCard
              data-testid="open-repo-button"
              title={'Open Existing Project'}
              handleSelect={() => openLocalFolder()}
              handleShowDocs={() => handleShowDocs('open')}
              disabled={isDisabled}
              icon={<FolderOpen />}
              subText={<>Select existing git project on your desktop</>}
            />
          )}
          {/* Create New Repository */}
          <OptionCard
            data-testid="create-repo-button"
            title={'Create New Project'}
            handleSelect={() => createRepo()}
            handleShowDocs={() => handleShowDocs('create')}
            disabled={isDisabled}
            icon={<CreateNewFolder />}
            subText={<>Create new git project on your desktop</>}
          />
        </List>
      </nav>
    </GlassCard>
  );
}

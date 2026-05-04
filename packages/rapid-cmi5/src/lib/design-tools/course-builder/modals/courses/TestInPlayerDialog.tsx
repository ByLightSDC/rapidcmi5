import {
  Box,
  Button,
  Collapse,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useSelector, useDispatch } from 'react-redux';
import { useContext, useState } from 'react';
import { modal, setModal } from '@rapid-cmi5/ui';
import {
  courseDataCache,
  currentAu,
  currentBlock,
} from '../../../../redux/courseBuilderReducer';
import { currentRepoAccessObjectSel } from '../../../../redux/repoManagerReducer';
import { testInPlayerModalId } from '../../../rapidcmi5_mdx/modals/constants';
import { ModalDialog } from '@rapid-cmi5/ui';
import { getFsInstance } from '../../GitViewer/utils/gitFsInstance';
import { GitContext } from '../../GitViewer/session/GitContext';

const DEFAULT_PLAYER_URL = 'http://localhost:4201';
// Electron IPC fallback: path relative to repo root
const DEFAULT_CONFIG_PATH = 'apps/cc-cmi5-player/src/test/config.json';

async function loadLessonViaZip(
  playerUrl: string,
  zipBlob: Blob,
  lessonDirPath: string,
): Promise<void> {
  const endpoint = `${playerUrl.replace(/\/$/, '')}/upload-lesson-zip?lessonDirPath=${encodeURIComponent(lessonDirPath)}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: zipBlob,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Player dev server responded ${res.status}: ${text}`);
  }
  const json = await res.json().catch(() => ({ success: false }));
  if (!json.success) {
    throw new Error(json.error ?? 'Player dev server returned success:false');
  }
}

async function writeConfigViaHttp(
  playerUrl: string,
  auJson: string,
): Promise<void> {
  const endpoint = `${playerUrl.replace(/\/$/, '')}/test-config`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: auJson,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Player dev server responded ${res.status}: ${text}`);
  }
  const json = await res.json().catch(() => ({ success: false }));
  if (!json.success) {
    throw new Error(json.error ?? 'Player dev server returned success:false');
  }
}

async function writeConfigViaIpc(
  auJson: string,
  playerUrl: string,
  configPath: string,
): Promise<void> {
  const result = await (window as any).ipc.testInPlayer(
    auJson,
    playerUrl,
    configPath,
  );
  if (!result?.success) {
    throw new Error(result?.error ?? 'IPC call returned success:false');
  }
}

export function TestInPlayerDialog() {
  const dispatch = useDispatch();
  const { currentCourse, downloadCmi5Player } = useContext(GitContext);
  const repoAccessObject = useSelector(currentRepoAccessObjectSel);
  const modalObj = useSelector(modal);
  const courseData = useSelector(courseDataCache);
  const currentAuIndex = useSelector(currentAu);
  const currentBlockIndex = useSelector(currentBlock);

  const [playerUrl, setPlayerUrl] = useState(DEFAULT_PLAYER_URL);
  const [configPath, setConfigPath] = useState(DEFAULT_CONFIG_PATH);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [rebuildPlayerZip, setRebuildPlayerZip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedBlock = courseData?.blocks?.[currentBlockIndex];
  const currentLesson = selectedBlock?.aus?.[currentAuIndex];
  const hasIpc = typeof (window as any).ipc?.testInPlayer === 'function';

  const handleClose = () => {
    setError(null);
    setStatusMsg(null);
    dispatch(setModal({ type: '', id: null, name: null }));
  };

  const handleLaunch = async () => {
    if (!currentLesson) {
      setError('No lesson selected.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusMsg(null);

    try {
      const fsInstance = getFsInstance();

      if (hasIpc) {
        // Electron: write config via IPC (no assets in this path)
        const auJson = JSON.stringify(currentLesson, null, 2);
        await writeConfigViaIpc(auJson, playerUrl, configPath);
      } else if (repoAccessObject && currentCourse?.basePath) {
        // Browser: build zip in-memory, ship to player dev server (includes assets)
        if (rebuildPlayerZip && downloadCmi5Player) {
          setStatusMsg('Downloading player zip…');
          await fsInstance.downloadCmi5PlayerIfNeeded(downloadCmi5Player);
        } else {
          setStatusMsg('Seeding player cache from dev server…');
          await fsInstance.seedPlayerCacheFromDevServer(playerUrl);
        }

        setStatusMsg('Building course zip…');

        // dirPath on the AU is relative (e.g. "sandbox/intro")
        const lessonDirPath = `compiled_course/blocks/${currentLesson.dirPath}`;

        const zipBlob = await fsInstance.buildCmi5CourseBlob(
          repoAccessObject,
          currentCourse.basePath,
        );

        setStatusMsg('Uploading to player…');
        await loadLessonViaZip(playerUrl, zipBlob, lessonDirPath);
      } else {
        // Fallback: content-only (no assets)
        const auJson = JSON.stringify(currentLesson, null, 2);
        await writeConfigViaHttp(playerUrl, auJson);
      }

      window.open(playerUrl, '_blank');
      handleClose();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setIsLoading(false);
      setStatusMsg(null);
    }
  };

  const lessonLabel = currentLesson
    ? `${selectedBlock?.blockName ?? ''} / ${currentLesson.auName}`
    : 'No lesson selected';

  return (
    <ModalDialog
      testId={testInPlayerModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === testInPlayerModalId,
        maxWidth: 'sm',
        fullWidth: true,
      }}
    >
      <>
        <DialogTitle>Test In Player</DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            sx={{ mb: '4px', color: 'text.secondary' }}
          >
            Publishes the current lesson (including assets) to the player dev
            server and opens it in a new tab. Make sure{' '}
            <code>nx serve cc-cmi5-player</code> is running.
          </Typography>

          <Typography
            variant="caption"
            display="block"
            sx={{ paddingTop: '8px', mb: 0.5, fontWeight: 'bold' }}
          >
            Lesson
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              px: 1.5,
              py: 1,
              borderRadius: 1,
              bgcolor: 'action.hover',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
            }}
          >
            {lessonLabel}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              mb: 1,
            }}
            onClick={() => setShowAdvanced((v) => !v)}
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold', mr: 0.5 }}>
              Advanced
            </Typography>
            {showAdvanced ? (
              <ExpandLessIcon fontSize="small" />
            ) : (
              <ExpandMoreIcon fontSize="small" />
            )}
          </Box>

          <Collapse in={showAdvanced}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                mt: 0.5,
              }}
            >
              <TextField
                label="CMI5 Player URL"
                value={playerUrl}
                onChange={(e) => setPlayerUrl(e.target.value)}
                size="small"
                fullWidth
                helperText="URL of the running cc-cmi5-player dev server"
              />
              {hasIpc && (
                <TextField
                  label="Config destination path"
                  value={configPath}
                  onChange={(e) => setConfigPath(e.target.value)}
                  size="small"
                  fullWidth
                  helperText="Electron only — path relative to repo root"
                />
              )}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={rebuildPlayerZip}
                    onChange={(e) => setRebuildPlayerZip(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      Use player zip asset
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      Off: Fetch index.html/cfg.json directly from the dev
                      server (works after a fresh clone).
                      <br />
                      On: Use the pre-built <code>cc-cmi5-player.zip</code> from
                      assets (run <code>npm run build:player-for-editor</code>{' '}
                      if stale).
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Collapse>

          {statusMsg && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              {statusMsg}
            </Typography>
          )}

          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>
              {error}
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleLaunch}
            disabled={isLoading || !currentLesson}
          >
            {isLoading ? 'Launching…' : 'Launch'}
          </Button>
        </DialogActions>
      </>
    </ModalDialog>
  );
}

export default TestInPlayerDialog;

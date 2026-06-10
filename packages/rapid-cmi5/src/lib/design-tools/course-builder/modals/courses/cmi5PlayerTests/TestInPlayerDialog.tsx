import {
  Box,
  Button,
  Collapse,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useSelector, useDispatch } from 'react-redux';
import { useContext, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { ButtonMinorUi, modal, setModal, useRangeApi } from '@rapid-cmi5/ui';
import { ScenarioApi } from '@rapid-cmi5/cmi5-build-common';
import {
  courseDataCache,
  currentAu,
  currentBlock,
} from '../../../../../redux/courseBuilderReducer';
import { currentRepoAccessObjectSel } from '../../../../../redux/repoManagerReducer';
import { testInPlayerModalId } from '../../../../rapidcmi5_mdx/modals/constants';
import { ModalDialog } from '@rapid-cmi5/ui';
import { GitContext } from '../../../GitViewer/session/GitContext';
import { useRapidCmi5Opts } from '../../../GitViewer/session/RapidCmi5OptsContext';
import {
  DEFAULT_ACTOR_HOMEPAGE,
  DEFAULT_RETURN_URL,
  useLaunchInPlayer,
} from './useLaunchInPlayer';
import { ScenarioSelectionModal } from '../../../../../features/scenarios/components/modals/ScenarioSelectionModal';

const DEFAULT_PLAYER_URL =
  'http://localhost:4201/course/blocks/name/au/index.html';
// Electron IPC fallback: path relative to repo root
const DEFAULT_CONFIG_PATH = 'apps/cc-cmi5-player/src/test/config.json';

const ENV_LMS_API_BASE = process.env['NX_PUBLIC_CPT_PLAYER_URL'];
const ENV_LMS_COURSE_ID = process.env['NX_PUBLIC_CPT_COURSE_ID'];
const ENV_LMS_TOKEN = process.env['NX_PUBLIC_CPT_TOKEN'];

const DEFAULT_LMS_API_BASE =
  ENV_LMS_API_BASE || 'https://cpt-player.develop-cp.rangeos.engineering';

export function TestInPlayerDialog() {
  const dispatch = useDispatch();
  const { currentCourse, downloadCmi5Player } = useContext(GitContext);
  const { isRangeEnabled } = useRangeApi();
  const repoAccessObject = useSelector(currentRepoAccessObjectSel);
  const modalObj = useSelector(modal);
  const courseData = useSelector(courseDataCache);
  const currentAuIndex = useSelector(currentAu);
  const currentBlockIndex = useSelector(currentBlock);
  const { userAuth } = useRapidCmi5Opts();

  const [playerUrl, setPlayerUrl] = useState(DEFAULT_PLAYER_URL);
  const [configPath, setConfigPath] = useState(DEFAULT_CONFIG_PATH);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [rebuildPlayerZip, setRebuildPlayerZip] = useState(false);
  const [useRealLaunchLink, setUseRealLaunchLink] = useState(false);
  const [lmsApiBase, setLmsApiBase] = useState(DEFAULT_LMS_API_BASE);
  const [lmsCourseId, setLmsCourseId] = useState(ENV_LMS_COURSE_ID ?? '');
  const [lmsToken, setLmsToken] = useState(ENV_LMS_TOKEN ?? '');
  const [actorName, setActorName] = useState(
    () => userAuth?.userName || userAuth?.userEmail || '',
  );
  const [actorHomePage, setActorHomePage] = useState(DEFAULT_ACTOR_HOMEPAGE);
  const [returnUrl, setReturnUrl] = useState(DEFAULT_RETURN_URL);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioApi | null>(
    null,
  );

  const { launch, isLoading, statusMsg, error, reset } = useLaunchInPlayer();

  const selectedBlock = courseData?.blocks?.[currentBlockIndex];
  const currentLesson = selectedBlock?.aus?.[currentAuIndex];
  const hasIpc = typeof (window as any).ipc?.testInPlayer === 'function';
  const resolvedActorName =
    actorName || userAuth?.userName || userAuth?.userEmail || '';
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);

  const handleClose = () => {
    reset();
    dispatch(setModal({ type: '', id: null, name: null }));
  };

  const handleLaunch = () =>
    launch({
      currentLesson,
      hasIpc,
      playerUrl,
      configPath,
      rebuildPlayerZip,
      repoAccessObject,
      currentCourse,
      downloadCmi5Player,
      useRealLaunchLink,
      lmsApiBase,
      lmsCourseId,
      lmsToken,
      resolvedActorName,
      actorHomePage,
      returnUrl,
      currentAuIndex,
      selectedScenario,
      onSuccess: handleClose,
    });

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

              <Divider sx={{ my: 0.5 }} />

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={useRealLaunchLink}
                    onChange={(e) => setUseRealLaunchLink(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      Use real cmi5 launch link
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      Requests a real launch URL from the LMS and opens it
                      against the local player.
                    </Typography>
                  </Box>
                }
              />

              {useRealLaunchLink && (
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                >
                  <TextField
                    label="LMS API base URL"
                    value={lmsApiBase}
                    onChange={(e) => setLmsApiBase(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="LMS course ID"
                    value={lmsCourseId}
                    onChange={(e) => setLmsCourseId(e.target.value)}
                    size="small"
                    fullWidth
                    required
                    helperText="Numeric course id (e.g. 1606)"
                  />
                  <TextField
                    label="Bearer token"
                    value={lmsToken}
                    onChange={(e) => setLmsToken(e.target.value)}
                    type="password"
                    size="small"
                    fullWidth
                    required
                    autoComplete="off"
                  />
                  <TextField
                    label="Actor name"
                    value={actorName}
                    onChange={(e) => setActorName(e.target.value)}
                    size="small"
                    fullWidth
                    placeholder={
                      userAuth?.userName || userAuth?.userEmail || 'learner'
                    }
                    helperText="Defaults to signed-in user when blank"
                  />
                  <TextField
                    label="Actor account home page"
                    value={actorHomePage}
                    onChange={(e) => setActorHomePage(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Return URL"
                    value={returnUrl}
                    onChange={(e) => setReturnUrl(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <Typography variant="caption" color="text.secondary">
                    Launches AU index <code>{currentAuIndex}</code>. The host in
                    the LMS response is rewritten to the Player URL above.
                  </Typography>
                </Box>
              )}

              {useRealLaunchLink && isRangeEnabled && (
                <Box>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ fontWeight: 'bold', mb: 0.5 }}
                  >
                    Scenario to launch with
                  </Typography>
                  <ButtonMinorUi
                    onClick={() => setIsScenarioModalOpen(true)}
                    fullWidth
                    startIcon={<SearchIcon />}
                    sx={{ height: 42, boxSizing: 'border-box' }}
                  >
                    Select Scenario
                  </ButtonMinorUi>
                  <ScenarioSelectionModal
                    onSelect={(scenario: ScenarioApi) =>
                      setSelectedScenario(scenario ?? null)
                    }
                    onClose={() => setIsScenarioModalOpen(false)}
                    open={isScenarioModalOpen}
                  />
                  {selectedScenario && (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        px: 1.5,
                        py: 1,
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                      }}
                    >
                      {selectedScenario.name}
                    </Typography>
                  )}
                </Box>
              )}
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

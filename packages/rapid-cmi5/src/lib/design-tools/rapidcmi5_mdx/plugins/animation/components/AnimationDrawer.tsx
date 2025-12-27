import React, { useCallback, useEffect } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Stack,
  Typography,
  Alert,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';
import {
  animationDrawerOpen$,
  slideAnimations$,
  selectedAnimation$,
  toggleAnimationDrawer$,
  moveAnimationUp$,
  moveAnimationDown$,
} from '../state/animationCells';
import { AnimationTimeline } from './AnimationTimeline';
import { AnimationPreview } from './AnimationPreview';
import { WrapWithAnimDirective } from './WrapWithAnimDirective';
import { useLexicalSelection } from '../hooks/useLexicalSelection';
import { highlightAnimatedElement } from '../utils/updateAnimationIndicators';
import { ButtonMinorUi } from '@rapid-cmi5/ui';

/**
 * Main animation drawer component
 * Displays animation timeline and configuration
 */
export function AnimationDrawer() {
  useLexicalComposerContext(); // Ensures we are inside a Lexical editor context
  const isOpen = useCellValue(animationDrawerOpen$);
  const animations = useCellValue(slideAnimations$);
  const selectedAnimationId = useCellValue(selectedAnimation$);
  const toggleDrawer = usePublisher(toggleAnimationDrawer$);
  const moveUp = usePublisher(moveAnimationUp$);
  const moveDown = usePublisher(moveAnimationDown$);

  // Hook into Lexical selection
  const { selectedInfo, isAnimatable } = useLexicalSelection();

  // Calculate move button states
  const selectedAnimIndex = animations.findIndex(
    (a) => a.id === selectedAnimationId,
  );
  const canMoveUp = selectedAnimationId && selectedAnimIndex > 0;
  const canMoveDown =
    selectedAnimationId &&
    selectedAnimIndex >= 0 &&
    selectedAnimIndex < animations.length - 1;

  const handleClose = useCallback(() => {
    toggleDrawer();
  }, [toggleDrawer]);

  // Keep the active animation badge in sync with the currently expanded item
  useEffect(() => {
    if (!isOpen) {
      highlightAnimatedElement(null);
      return;
    }

    const selectedAnim = animations.find((a) => a.id === selectedAnimationId);
    // Prefer directiveId (stable) over targetNodeKey (ephemeral)
    highlightAnimatedElement(
      selectedAnim?.directiveId ?? selectedAnim?.targetNodeKey ?? null,
    );
  }, [isOpen, animations, selectedAnimationId]);

  const handleMoveUp = useCallback(() => {
    if (selectedAnimationId) {
      moveUp(selectedAnimationId);
    }
  }, [moveUp, selectedAnimationId]);

  const handleMoveDown = useCallback(() => {
    if (selectedAnimationId) {
      moveDown(selectedAnimationId);
    }
  }, [moveDown, selectedAnimationId]);

  // Avoid rendering heavy drawer contents when closed
  if (!isOpen) {
    highlightAnimatedElement(null);
    return null;
  }

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      variant="persistent" // Stay open while user clicks elsewhere
      onClose={handleClose}
      sx={{
        position: 'absolute',
        zIndex: 1400, // Higher than MUI modals (1300) and directive editors
      }}
      PaperProps={{
        sx: {
          width: 360,
          maxWidth: '90vw',
          //TODO top: 42,
          zIndex: 1400, // Ensure paper also has high z-index
        },
      }}
    >
      <Stack direction="column" sx={{ height: '100%' }}>
        {/* Header */}
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            padding: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <IconButton onClick={handleClose} aria-label="Close animation drawer">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1, marginLeft: 1 }}>
            Animation
          </Typography>
        </Stack>

        {/* Selected Element Info */}
        <Box sx={{ padding: 2, borderBottom: 1, borderColor: 'divider' }}>
          {selectedInfo && isAnimatable ? (
            <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                Selected: {selectedInfo.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedInfo.nodeType}
              </Typography>
            </Alert>
          ) : selectedInfo && !isAnimatable ? (
            <Alert severity="warning" sx={{ mb: 1 }}>
              <Typography variant="body2">
                Cannot animate selected element(s)
              </Typography>
              <Typography variant="caption">
                {selectedInfo.isEmpty
                  ? 'Element is empty'
                  : 'Select a different element'}
              </Typography>
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mb: 1 }}>
              <Typography variant="body2">
                Click on an element in the editor
              </Typography>
              <Typography variant="caption">
                Paragraphs, headings, images, videos, etc.
              </Typography>
            </Alert>
          )}
        </Box>

        {/* Add / Wrap section */}
        <Box sx={{ px: 2, py: 2 }}>
          {/* COMMENTED OUT: V1 Add Animation - Using V2 directive-based approach only
          <ButtonMinorUi
            startIcon={<AddIcon />}
            onClick={handleAddAnimation}
            fullWidth
            disabled={!isAnimatable || !selectedElementKey}
          >
            Add Animation (V1)
          </ButtonMinorUi>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', marginTop: 1 }}
          >
            {!selectedElementKey
              ? 'Select an element in the editor first'
              : 'Add animation to selected element'}
          </Typography>

          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          */}

          {/* Phase 2: Wrap with Animation Directive (V2) */}
          <WrapWithAnimDirective />

          {/* COMMENTED OUT: Closing tag for V1 section
          </Box>
          */}
        </Box>

        {/* Divider between add/wrap and move controls */}
        <Divider />

        {/* Move Up/Down Buttons */}
        <Box sx={{ px: 2, py: 2 }}>
          <Stack direction="row" spacing={1}>
            <ButtonMinorUi
              startIcon={<ArrowUpwardIcon />}
              onClick={handleMoveUp}
              fullWidth
              disabled={!canMoveUp}
            >
              Move Up
            </ButtonMinorUi>
            <ButtonMinorUi
              startIcon={<ArrowDownwardIcon />}
              onClick={handleMoveDown}
              fullWidth
              disabled={!canMoveDown}
            >
              Move Down
            </ButtonMinorUi>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', marginTop: 1 }}
          >
            {!selectedAnimationId
              ? 'Select an animation in the timeline to reorder'
              : canMoveUp || canMoveDown
                ? 'Move the selected animation up or down'
                : 'Cannot move - animation is at the edge'}
          </Typography>
        </Box>

        {/* Timeline List */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <AnimationTimeline animations={animations} />
        </Box>

        {/* Preview Controls */}
        <AnimationPreview />

        {/* Footer Info */}
        <Box
          sx={{
            padding: 2,
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: 'background.default',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {animations.length} animation{animations.length !== 1 ? 's' : ''} in
            timeline
          </Typography>
        </Box>
      </Stack>
    </Drawer>
  );
}

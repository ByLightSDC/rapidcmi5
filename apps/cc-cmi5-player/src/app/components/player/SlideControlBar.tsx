import { useCallback, useEffect, useRef, useState } from 'react';
import { alpha, Stack, Tooltip, useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import { TOOLTIP_ENTER_DELAY, TOOLTIP_ENTER_NEXT_DELAY } from '../Menu/shared';

interface SlideControlBarProps {
  /** Whether a previous slide exists. */
  canGoPrevious: boolean;
  /** Whether a next slide exists. */
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  /** False on slides with no animations — the motion control is then disabled. */
  hasAnimations: boolean;
  isPaused: boolean;
  /** True once the sequence has finished, so the control offers replay instead. */
  isComplete: boolean;
  onTogglePause: () => void;
  onReplay: () => void;
}

/**
 * Bottom-center slide controls: previous/next slide plus animation
 * pause/resume.
 *
 * The pause control exists to satisfy WCAG 2.1 SC 2.2.2 (Pause, Stop, Hide):
 * slide animations start automatically, and any that run longer than five
 * seconds must offer the user a way to pause them.
 *
 * Keyboard model (per the ticket): the bar is a single tab stop — one Tab
 * reaches the group, then Left/Right move between the buttons and Escape
 * returns focus to the slide content, so users don't tab through every button.
 * This is the standard `role="toolbar"` roving-tabindex pattern from the
 * WAI-ARIA Authoring Practices.
 */
export default function SlideControlBar({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  hasAnimations,
  isPaused,
  isComplete,
  onTogglePause,
  onReplay,
}: SlideControlBarProps) {
  const { button, palette } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  // Index of the button holding tabindex="0" (the group's single tab stop).
  const [focusedIndex, setFocusedIndex] = useState(0);

  const motionDisabled = !hasAnimations;

  const buttons = [
    {
      key: 'previous',
      label: 'Previous slide',
      icon: <ArrowBackIosNewIcon fontSize="small" color="inherit" />,
      onClick: onPrevious,
      disabled: !canGoPrevious,
    },
    isComplete
      ? {
          key: 'replay',
          label: 'Replay animations',
          icon: <ReplayIcon fontSize="small" color="inherit" />,
          onClick: onReplay,
          disabled: motionDisabled,
        }
      : {
          key: 'pause',
          label: isPaused ? 'Resume animations' : 'Pause animations',
          icon: isPaused ? (
            <PlayArrowIcon fontSize="small" color="inherit" />
          ) : (
            <PauseIcon fontSize="small" color="inherit" />
          ),
          onClick: onTogglePause,
          disabled: motionDisabled,
        },
    {
      key: 'next',
      label: 'Next Slide',
      icon: <ArrowForwardIosIcon fontSize="small" color="inherit" />,
      onClick: onNext,
      disabled: !canGoNext,
    },
  ];

  // The roving tab stop must sit on an ENABLED button. A disabled button is not
  // focusable and is dropped from the accessibility tree, so parking the group's
  // only tabIndex={0} on one (e.g. "Previous" while on the first slide) would
  // leave the whole toolbar unreachable by keyboard.
  const firstEnabledIndex = buttons.findIndex((b) => !b.disabled);
  const activeIndex =
    !buttons[focusedIndex] || buttons[focusedIndex].disabled
      ? firstEnabledIndex
      : focusedIndex;

  useEffect(() => {
    if (activeIndex !== focusedIndex && activeIndex >= 0) {
      setFocusedIndex(activeIndex);
    }
  }, [activeIndex, focusedIndex]);

  const focusButtonAt = useCallback((index: number) => {
    const el = containerRef.current?.querySelectorAll<HTMLButtonElement>(
      'button[data-slide-control]',
    );
    el?.[index]?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const lastIndex = buttons.length - 1;

      // Step over disabled buttons — they can't take focus, so landing on one
      // would strand the user mid-group.
      const nextEnabled = (from: number, step: number): number => {
        for (let i = 1; i <= buttons.length; i++) {
          const candidate =
            (from + step * i + buttons.length * i) % buttons.length;
          if (!buttons[candidate].disabled) return candidate;
        }
        return from;
      };
      const firstEnabled = (from: number, step: number): number => {
        for (let i = 0; i < buttons.length; i++) {
          const candidate = from + step * i;
          if (candidate < 0 || candidate > lastIndex) break;
          if (!buttons[candidate].disabled) return candidate;
        }
        return activeIndex;
      };

      let nextIndex: number | null = null;

      switch (event.key) {
        case 'ArrowRight':
          nextIndex = nextEnabled(activeIndex, 1);
          break;
        case 'ArrowLeft':
          nextIndex = nextEnabled(activeIndex, -1);
          break;
        case 'Home':
          nextIndex = firstEnabled(0, 1);
          break;
        case 'End':
          nextIndex = firstEnabled(lastIndex, -1);
          break;
        case 'Escape': {
          // Hand focus back to the slide content, per the ticket's
          // "escape to tab back to parent".
          event.preventDefault();
          const slide = document.getElementById('main-content');
          slide?.focus({ preventScroll: true });
          return;
        }
        default:
          return;
      }

      if (nextIndex === null) return;
      event.preventDefault();
      setFocusedIndex(nextIndex);
      focusButtonAt(nextIndex);
    },
    [buttons, activeIndex, focusButtonAt],
  );

  return (
    <Stack
      ref={containerRef}
      role="toolbar"
      aria-label="Slide controls"
      aria-orientation="horizontal"
      direction="row"
      spacing={0.5}
      onKeyDown={handleKeyDown}
      sx={{
        // Pinned to the viewport rather than the content flow. With `sticky` the
        // bar only pinned once a slide was tall enough to scroll — on shorter
        // slides it sat wherever the content happened to end, so the controls
        // appeared to jump between slides. `fixed` keeps them a constant
        // distance from the bottom regardless of content height.
        //
        // Horizontally centred over the slide panel. Both vars are maintained by
        // a ResizeObserver in MenuLayout, so the bar tracks the collapsible
        // drawer and the resizable split panel.
        position: 'fixed',
        bottom: 24,
        left: 'calc(var(--panel-width, 0px) + var(--slide-panel-width, 100vw) / 2)',
        transform: 'translateX(-50%)',
        zIndex: (theme) => theme.zIndex.appBar + 1,
        width: 'fit-content',
        px: 1,
        py: 0.5,
        alignItems: 'center',
        borderRadius: '999px',
        backgroundColor: alpha(palette.background.paper, 0.92),
        border: `1px solid ${alpha(palette.text.primary, 0.12)}`,
        boxShadow: 2,
      }}
    >
      {buttons.map((btn, index) => (
        <Tooltip
          key={btn.key}
          title={btn.label}
          enterDelay={TOOLTIP_ENTER_DELAY}
          enterNextDelay={TOOLTIP_ENTER_NEXT_DELAY}
        >
          {/* span keeps the tooltip working while the button is disabled */}
          <span>
            <IconButton
              data-slide-control
              data-testid={`slide-control-${btn.key}`}
              aria-label={btn.label}
              size="small"
              disabled={btn.disabled}
              // Roving tabindex: exactly one ENABLED button is tabbable.
              tabIndex={index === activeIndex ? 0 : -1}
              onFocus={() => setFocusedIndex(index)}
              onClick={btn.onClick}
              sx={{ color: button.iconColor }}
            >
              {btn.icon}
            </IconButton>
          </span>
        </Tooltip>
      ))}
    </Stack>
  );
}

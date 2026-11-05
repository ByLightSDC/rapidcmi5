import React, { useEffect, useState } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import { AnimationItem } from './AnimationItem';
import { AnimationConfig } from '../types/Animation.types';
import { useCellValue } from '@mdxeditor/gurx';
import { selectedAnimation$ } from '../state/animationCells';

interface Props {
  animations: AnimationConfig[];
}

export function AnimationTimeline({ animations }: Props) {
  // Sort animations into display order, then set the initial tab stop to selected or first if none selected.
  const selectedAnimationId = useCellValue(selectedAnimation$);
  const sortedAnimations = [...animations].sort((a, b) => a.order - b.order);
  const [tabStopId, setTabStopId] = useState<string | null>(
    selectedAnimationId ?? sortedAnimations[0]?.id ?? null,
  );
  // Keep the tab stop valid as list changes. Follow selection on change and use first remaining item on removal
  useEffect(() => {
    setTabStopId((currentTabStopId) => {
      const selectedIsPresent = sortedAnimations.some(
        (animation) => animation.id === selectedAnimationId,
      );
      if (selectedAnimationId && selectedIsPresent) return selectedAnimationId;

      const currentTabStopIsPresent = sortedAnimations.some(
        (animation) => animation.id === currentTabStopId,
      );
      return currentTabStopIsPresent
        ? currentTabStopId
        : (sortedAnimations[0]?.id ?? null);
    });
  }, [animations, selectedAnimationId]);

  if (animations.length === 0) {
    return (
      <Box
        data-animation-initial-focus="true"
        tabIndex={-1}
        sx={{ padding: 2, textAlign: 'center' }}
      >
        <Typography variant="body2" color="text.secondary">
          No animations yet. Click "Add Animation" to get started.
        </Typography>
      </Box>
    );
  }

  const handleHeaderKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    const target = event.target;
    if (
      !(target instanceof HTMLElement) ||
      target.dataset.animationItemHeader !== 'true'
    ) {
      return;
    }

    // Find the headers, move to next/previous, and wrap at either end
    const headers = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        '[data-animation-item-header="true"]',
      ),
    );
    const currentIndex = headers.indexOf(target);
    if (currentIndex < 0 || headers.length < 2) return;

    // Use preventDefault to stop arrow key from scrolling the page
    event.preventDefault();
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + headers.length) % headers.length;
    headers[nextIndex].focus();
  };

  return (
    <Stack
      direction="column"
      role="group"
      aria-label="Animation timeline"
      onKeyDown={handleHeaderKeyDown}
      sx={{
        padding: 1,
      }}
    >
      {sortedAnimations.map((animation) => (
        <AnimationItem
          key={animation.id}
          animation={animation}
          isTabStop={tabStopId === animation.id}
          onHeaderFocus={() => setTabStopId(animation.id)}
        />
      ))}
    </Stack>
  );
}

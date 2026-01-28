import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import { AnimationItem } from './AnimationItem';
import { AnimationConfig } from '../types/Animation.types';

interface Props {
  animations: AnimationConfig[];
}

export function AnimationTimeline({ animations }: Props) {
  if (animations.length === 0) {
    return (
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No animations yet. Click "Add Animation" to get started.
        </Typography>
      </Box>
    );
  }

  // Sort by order to ensure correct sequence
  const sortedAnimations = [...animations].sort((a, b) => a.order - b.order);

  return (
    <Stack
      direction="column"
      sx={{
        padding: 1,
      }}
    >
      {sortedAnimations.map((animation) => (
        <AnimationItem key={animation.id} animation={animation} />
      ))}
    </Stack>
  );
}

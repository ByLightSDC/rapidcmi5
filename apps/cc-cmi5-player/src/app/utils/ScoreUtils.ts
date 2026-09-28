import type { SlideActivityScore } from '@rapid-cmi5/cmi5-build-common';

/**
 * Calculates the percentage represented by a score.
 */
export function calculateScorePercentage(score: SlideActivityScore): number {
  return (score.raw / score.max) * 100;
}

/**
 * Determines whether a score reaches a percentage-based passing threshold.
 */
export function doesScorePass(
  score: SlideActivityScore,
  passingScore: number,
): boolean {
  return calculateScorePercentage(score) >= passingScore;
}

// Plugin
export { animationPlugin } from './AnimationPlugin';
export type { AnimationPluginParams } from './AnimationPlugin';

// Types
export * from './types/Animation.types';

// State (for external access)
export {
  slideAnimations$,
  selectedAnimation$,
  animationDrawerOpen$,
  selectedElement$,
  playbackState$,
  prefersReducedMotion$,
  addAnimation$,
  updateAnimation$,
  deleteAnimation$,
  reorderAnimations$,
  setAnimations$,
  playAnimation$,
  moveAnimationUp$,
  moveAnimationDown$,
  toggleAnimationDrawer$,
  playAllAnimations$,
  stopPlayback$,
} from './state/animationCells';

// Components (if needed externally)
export { AnimationDrawer } from './components/AnimationDrawer';
export { AnimationTimeline } from './components/AnimationTimeline';
export { AnimationItem } from './components/AnimationItem';
export { AnimationPreview } from './components/AnimationPreview';
export { WrapWithAnimDirective } from './components/WrapWithAnimDirective';

// Utilities for frontmatter handling
export { parseAnimationsFromFrontmatter } from './visitors/MdastAnimationImport';
export { injectAnimationsIntoFrontmatter } from './visitors/LexicalAnimationExport';

// Animation engine
export { AnimationEngine } from './engine/AnimationEngine';

// Utilities
export * from './utils/lexicalSelection';
export {
  updateAnimationIndicators,
  clearAnimationIndicators,
  highlightAnimatedElement,
} from './utils/updateAnimationIndicators';
export {
  addAnimationIdsToElements,
  findElementByNodeKey,
  setupAnimationIdRefresh,
  getOrphanedAnimationKeys,
} from './utils/lexicalDomBridge';
export {
  generateStableId,
  findNodeKeyByStableId,
  resolveAnimations,
} from './utils/stableIdentifiers';
export {
  findDirectiveNodeKeyById,
  resolveDirectiveAnimations,
  getAllDirectiveIds,
  isDirectiveIdInUse,
} from './utils/directiveResolver';
export { cleanupOrphanedAnimations } from './utils/cleanupOrphanedAnimations';
export {
  cleanupOrphanedDirectiveAnimations,
  findAnimationsByDirectiveId,
  hasAnimationsForDirective,
  getUnusedDirectiveIds,
} from './utils/cleanupOrphanedDirectives';
export { areAnimationsEqual } from './utils/animationComparison';

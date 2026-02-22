import {
  BlockPaddingEnum,
  ContentWidthEnum,
} from '@rapid-cmi5/cmi5-build-common';

export const contentWidthDescriptions = new Map<ContentWidthEnum, string>([
  [ContentWidthEnum.None, 'No width constraint (default)'],
  [ContentWidthEnum.Small, 'Narrow content area (55% of available width)'],
  [ContentWidthEnum.Medium, 'Standard content area (75% of available width)'],
  [ContentWidthEnum.Large, 'Full width content area'],
]);

export const blockPaddingDescriptions = new Map<BlockPaddingEnum, string>([
  [BlockPaddingEnum.None, 'No block spacing (default)'],
  [BlockPaddingEnum.Small, 'Compact spacing between blocks (8px)'],
  [BlockPaddingEnum.Medium, 'Standard spacing between blocks (32px)'],
  [BlockPaddingEnum.Large, 'Generous spacing between blocks (64px)'],
  [BlockPaddingEnum.Custom, 'Custom padding value'],
]);

import { DirectiveDescriptor } from '@mdxeditor/editor';
import { ActivityType } from '@rapid-cmi5/cmi5-build/common';
import { ActivityPlayback } from './ActivityPlayback';

/**
 * Non editor version of ActivityDirectiveDescriptor
 * Renders activities in lexical view
 */
export const ActivityDirectiveDescriptor: DirectiveDescriptor = {
  name: 'activity',
  testNode(node) {
    return ActivityType.includes(node.name);
  },
  attributes: [],
  hasChildren: false,
  Editor: ActivityPlayback,
};

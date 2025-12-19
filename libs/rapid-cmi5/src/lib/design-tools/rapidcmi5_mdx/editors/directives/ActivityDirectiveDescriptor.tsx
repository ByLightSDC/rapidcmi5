import { DirectiveDescriptor } from '@mdxeditor/editor';

import { ActivityEditor } from './ActivityEditor';
import { ActivityType } from '@rapid-cmi5/cmi5-build/common';

/**
 * MDX Activity Config
 */
export const ActivityDirectiveDescriptor: DirectiveDescriptor = {
  name: 'activity',
  testNode(node) {
    return ActivityType.includes(node.name);
  },
  // set some attribute names to have the editor display a property editor popup.
  attributes: [],
  // used by the generic editor to determine whether or not to render a nested editor.
  hasChildren: false,
  Editor: ActivityEditor,
};

import { realmPlugin, addComposerChild$ } from '@mdxeditor/editor';
import { DraggableBlockHandle } from './DraggableBlockHandle';

export const draggableBlockPlugin = realmPlugin({
  init(realm) {
    realm.pubIn({
      [addComposerChild$]: [DraggableBlockHandle],
    });
  },
});

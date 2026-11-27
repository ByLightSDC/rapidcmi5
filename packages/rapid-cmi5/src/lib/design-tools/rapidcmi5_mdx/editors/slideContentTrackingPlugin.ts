import {
  initialMarkdownNormalize$,
  markdown$,
  muteChange$,
  realmPlugin,
} from '@mdxeditor/editor';
import { SlideContentTracker } from './SlideContentTracker';

export function createSlideContentTrackingPlugin(tracker: SlideContentTracker) {
  return realmPlugin({
    init(realm) {
      // An import can serialize to exactly the previous editor value, in
      // which case markdown$ does not emit. Capture its completion too.
      realm.sub(muteChange$, (muted) => {
        if (!muted) tracker.observe(realm.getValue(markdown$), true);
      });
      realm.sub(markdown$, (markdown) => {
        tracker.observe(
          markdown,
          realm.getValue(muteChange$) ||
            realm.getValue(initialMarkdownNormalize$),
        );
      });
    },
  })();
}

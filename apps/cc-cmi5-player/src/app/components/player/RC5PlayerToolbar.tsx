import { useRealm } from '@mdxeditor/editor';
import {
  debugLog,
  editorInPlayback$,
  fnUrl$,
  getActivityCache$,
  setActivityCache$,
  setProgress$,
  submitScore$,
} from '@rapid-cmi5/ui';
import { useContext, useEffect } from 'react';
import { AuManagerContext } from '../../session/AuManager';

export const RC5PlayerToolbar: React.FC = () => {
  const realm = useRealm();
  const { setProgress, submitScore, getActivityCache, setActivityCache } =
    useContext(AuManagerContext);

  useEffect(() => {
    realm.pub(editorInPlayback$, true);
    realm.pub(fnUrl$, '');
    realm.pub(setProgress$, setProgress);
    realm.pub(submitScore$, submitScore);
    realm.pub(getActivityCache$, getActivityCache);
    realm.pub(setActivityCache$, setActivityCache);
  }, [realm, setProgress, submitScore]);

  return <div />;
};

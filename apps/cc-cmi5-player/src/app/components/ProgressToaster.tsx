import { useToaster } from '@rapid-cmi5/ui';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  nextProgressToastSel,
  removeProgressToast,
} from '../redux/progressNotificationReducer';

export default function ProgressToaster() {
  const nextToast = useSelector(nextProgressToastSel);
  const displayToaster = useToaster();
  const dispatch = useDispatch();
  const displayedToastId = useRef<number | null>(null);

  useEffect(() => {
    if (!nextToast || displayedToastId.current === nextToast.id) return;

    displayedToastId.current = nextToast.id;
    displayToaster(nextToast.toast);
    dispatch(removeProgressToast(nextToast.id));
  }, [nextToast, displayToaster, dispatch]);

  return null;
}

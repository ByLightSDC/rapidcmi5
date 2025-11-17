import { AppMenuConfigItem, useNavBar } from '@rangeos-nx/ui/branded';
import {
  setAppHeaderVisible,
  setBreadCrumbVisible,
} from '@rangeos-nx/ui/redux';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Embeds an iFrame
 * @param {string} src URL to embed
 * @returns
 */
export default function IFrameLanding({
  config,
}: {
  config: AppMenuConfigItem;
}) {
  useNavBar(-1);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setBreadCrumbVisible(false));

    return () => {
      dispatch(setBreadCrumbVisible(true));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <iframe
      title="landing"
      src={config.url}
      width="100%"
      height="100%"
    ></iframe>
  );
}

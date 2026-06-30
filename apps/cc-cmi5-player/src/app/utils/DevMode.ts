import { cmi5Instance } from '../session/cmi5';
import { debugLog } from '@rapid-cmi5/ui';

const dev_mode_message =
  'You are currently in dev mode, no calls will be made to the LRS.';

export function checkForDevMode(): boolean {
  if (!cmi5Instance) {
    debugLog('Missing Cmi5 Instance, Dev Mode True');
    return true;
  }
  if (cmi5Instance.getLaunchParameters().fetch === 'test') {
    debugLog(dev_mode_message);
    return true;
  }

  return false;
}

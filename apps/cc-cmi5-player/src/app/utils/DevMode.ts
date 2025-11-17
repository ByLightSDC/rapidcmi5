import { debuglog } from 'util';
import { cmi5Instance } from '../session/cmi5';

const dev_mode_message =
  'You are currently in dev mode, no calls will be made to the LRS.';

export function checkForDevMode(): boolean {
  if (!cmi5Instance) {
    debuglog('Missing Cmi5 Instance, Dev Mode True');
    return true;
  }
  if (cmi5Instance.getLaunchParameters().fetch === 'test') {
    debuglog(dev_mode_message);
    return true;
  }

  return false;
}

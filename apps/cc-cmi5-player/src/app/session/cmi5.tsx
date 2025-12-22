import { debugLog } from '@rapid-cmi5/ui';
import Cmi5 from '@xapi/cmi5';

let cmi5Instance: Cmi5;

try {
  cmi5Instance = new Cmi5();
} catch (error) {
  document.location.search =
    'endpoint=test&fetch=test&actor=test&activityId=test&registration=test';
  debugLog('Cmi5 params not working, assuming test, ', error);
}
export { cmi5Instance };

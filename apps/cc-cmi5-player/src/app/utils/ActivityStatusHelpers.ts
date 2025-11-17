import { logger } from '../debug';
import { store } from '../redux/store';
import {
  ActivityCompletionPayload,
  SlideActivityStatus,
} from '../types/SlideActivityStatusState';

export async function updateActivityStatus(
  payload: ActivityCompletionPayload,
  passed = false,
): Promise<void> {
  logger.debug('Activity.updateActivityStatus', { payload, passed }, 'lms');

  // Update Redux state directly
  const currentState = store.getState();
  const { courseAUProgress } = currentState.au;

  if (courseAUProgress?.progress?.activityStatus) {
    const { activityId } = payload;
    const activityStatus: SlideActivityStatus = {
      type: payload.type,
      slideIndex: payload.slideIndex,
      slideGuid: payload.slideGuid,
      completed: true,
      passed,
      score: payload.score,
      metadata: payload.metadata,
      completedAt: new Date().toISOString(),
      meetsCriteria: payload?.meetsCriteria || false,
      ...(passed && { passedAt: new Date().toISOString() }), // Add passedAt if passed is true
    };

    console.log('updating activity status to ', activityStatus);
    // Update the Redux state
    store.dispatch({
      type: 'au/updateActivityStatus',
      payload: { activityId, activityStatus },
    });
  }
}

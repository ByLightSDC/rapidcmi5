import { SlideActivityStatus } from '../types/SlideActivityStatusState';

/**
 * Activity IDs only have to be unique within a slide. Prefix them with the
 * encoded slide GUID before using them in the AU-wide activity-status map.
 */
export function getActivityStatusKey(
  slideGuid: string,
  activityId: string,
): string {
  return `${encodeURIComponent(slideGuid)}::${encodeURIComponent(activityId)}`;
}

export function getActivityStatus(
  activityStatus: Record<string, SlideActivityStatus>,
  slideGuid: string,
  activityId: string,
): SlideActivityStatus | undefined {
  return activityStatus[getActivityStatusKey(slideGuid, activityId)];
}

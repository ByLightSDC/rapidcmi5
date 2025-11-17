import { CourseAU } from '@rangeos-nx/types/cmi5';

export type ClassEntry = {
  classId: string;
  id?: string;
};

export const defaultClassEntryData = {
  classId: '',
  uuid: '', //conform to iListItemType
  name: '',
};

export const defaultCourseAuData: CourseAU = {
  dirPath: '',
  title: 'Loading...',
  slides: [],
  auName: '',
  assetsPath: '',
  rangeosScenarioName: '',
  rangeosScenarioUUID: '',
  teamSSOEnabled: undefined,
  // Aaron do we need to support these?
  // backgroundImageOverride: '',
  // rangeosScenario: false,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from '@rangeos-nx/frontend/environment';
import {
  // APIs
  AIApiFactory,
  Cmi5EnrollmentApiFactory,
  Cmi5ManagementApiFactory,
  CourseEnrollmentApiFactory,
  CourseInstructorApiFactory,
  CourseManagementApiFactory,
  LRSGradesApiFactory,
  LRSStatementApiFactory,
  MoodleEnrollmentApiFactory,
  MoodleManagementApiFactory,
  NICEKSATsApiFactory,
} from './lib';
// import type { ScenarioGroup } from './lib';

//#endregion

export let LMS_API_URL = config.LMS_API_URL || 'http://localhost:8080';

export const initializeLMSApiClient = (apiUrl?: string) => {
  if (apiUrl) {
    LMS_API_URL = apiUrl;
  }

  //APIs
  const AIApi = AIApiFactory(undefined, LMS_API_URL);
  const CourseEnrollmentApi = CourseEnrollmentApiFactory(
    undefined,
    LMS_API_URL,
  );
  const CourseInstructorApi = CourseInstructorApiFactory(
    undefined,
    LMS_API_URL,
  );
  const NICEKSATsApi = NICEKSATsApiFactory(undefined, LMS_API_URL);

  //#endregion

  return {
    ...AIApi,
    ...CourseEnrollmentApi,
    ...CourseInstructorApi,
    ...NICEKSATsApi,
  };
};
export let LmsApiClient = initializeLMSApiClient();
export const overrideDevOpsApiClient = (apiUrl?: string) => {
  console.log('initializeLmsApiClient', apiUrl);
  LmsApiClient = initializeLMSApiClient(apiUrl);
};

//Types & Interfaces
export type { Element, KsaTsListElementTypeEnum } from './lib';

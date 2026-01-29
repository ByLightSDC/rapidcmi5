/* eslint-disable @typescript-eslint/no-explicit-any */
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

//#endregion

export let LMS_API_URL =
  process.env['NX_PUBLIC_LMS_API_URL'] || 'http://localhost:8080';

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
  const CourseManagementApi = CourseManagementApiFactory(
    undefined,
    LMS_API_URL,
  );
  const NICEKSATsApi = NICEKSATsApiFactory(undefined, LMS_API_URL);

  //#endregion

  return {
    ...AIApi,
    ...CourseEnrollmentApi,
    ...CourseInstructorApi,
    ...CourseManagementApi,
    ...NICEKSATsApi,
  };
};
export let LmsApiClient = initializeLMSApiClient();
export const overrideDevOpsApiClient = (apiUrl?: string) => {
  LmsApiClient = initializeLMSApiClient(apiUrl);
};

//Types & Interfaces
export type {
  Course,
  CourseEnrollmentRequest,
  Element,
  ClassDeployment,
  ClassDeploymentRequest,
  CourseMetaCreate,
  CourseMetaUpdate,
  CourseMeta,
  EnrolledCourse,
} from './lib';

//Enums
export {
  CourseEnrollmentRequestTypeEnum,
  ElementElementTypeEnum,
  KsaTsListElementTypeEnum,
} from './lib';

import { getErrorMessage } from './errorMessages';
import { CourseData } from '@rangeos-nx/types/cmi5';

const mockCourse: CourseData = {
  author: 'test-author',
  courseTitle: 'test-title',
  courseDescription: 'test-description',
  courseId: 'test-id',
  blocks: [],
};

export const useGetCourseFile = ({
  id,
  publicUrl,
}: {
  id: string;
  publicUrl?: boolean;
}) => {
  try {
    //TODO
    return mockCourse;
  } catch (error: any) {
    throw getErrorMessage(
      error,
      'An error occurred retrieving the Course File',
    );
  }
};

export const usePostCourseFile = () => {
  try {
    //TODO
    return mockCourse;
  } catch (error: any) {
    throw getErrorMessage(error, 'An error occurred creating the Course File');
  }
};

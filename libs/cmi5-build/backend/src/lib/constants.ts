import path from 'path';

const testPath = path.join(__dirname, 'tests');

export const coursePaths = {
  testPath,
  basicCourseNoNav: path.join(testPath, 'basicCourseNoNav'),
  basicCourseWithNav: path.join(testPath, 'basicCourseWithNav'),
  advancedCourseNoNav: path.join(testPath, 'advancedCourseNoNav'),
  advancedCourseWithNav: path.join(testPath, 'advancedCourseWithNav'),
  basicCourseWithNestedNav: path.join(testPath, 'basicCourseWithNestedNav'),
  exam: path.join(testPath, 'net_exam_1'),

  advancedCourseWithNestedNav: path.join(
    testPath,
    'advancedCourseWithNestedNav',
  ),
  basicQuiz: path.join(testPath, 'quiz.md'),
  quizWindows: path.join(testPath, 'quizWindows.md'),
  basicQuizWithMeta: path.join(testPath, 'quizWithMeta.md'),
  jobeSlides: path.join(testPath, 'jobeSlides'),

};

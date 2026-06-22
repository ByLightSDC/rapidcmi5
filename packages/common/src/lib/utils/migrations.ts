// temporary migration strategy until we add in a more advanced versioning
// for our data types to migrate properly

export function migrateCourseData(rawCourseData: any) {
  if (!rawCourseData) return rawCourseData;

  migrateLessonThemeToCourseTheme(rawCourseData);

  return rawCourseData;
}

type ThemeBag = Record<string, unknown>;
type RawAu = { lessonTheme?: ThemeBag } & Record<string, unknown>;
type RawBlock = { aus?: RawAu[] } & Record<string, unknown>;
type RawCourseData = {
  blocks?: RawBlock[];
  courseTheme?: ThemeBag;
} & Record<string, unknown>;

/**
 * lessonTheme is being removed in favor of a single courseTheme. Promote the
 * first lesson's theme into courseTheme (only for keys courseTheme hasn't set),
 * then strip lessonTheme from every AU.
 */
function migrateLessonThemeToCourseTheme(rawCourseData: RawCourseData) {
  const blocks = rawCourseData.blocks;
  if (!Array.isArray(blocks)) return;

  const courseTheme: ThemeBag = rawCourseData.courseTheme ?? {};
  let firstLessonTheme: ThemeBag | undefined;

  for (const block of blocks) {
    const aus = block?.aus;
    if (!Array.isArray(aus)) continue;

    for (const au of aus) {
      if (!firstLessonTheme && au?.lessonTheme) {
        firstLessonTheme = au.lessonTheme;
      }
      if (au) au.lessonTheme = undefined;
    }
  }

  if (firstLessonTheme) {
    for (const [key, value] of Object.entries(firstLessonTheme)) {
      if (courseTheme[key] === undefined) {
        courseTheme[key] = value;
      }
    }
    rawCourseData.courseTheme = courseTheme;
  }
}

import YAML from 'yaml';

import { getScenarioDirectives } from '../codeValidators/markdownValidator';
import { CourseData } from '../types/courseStructure/course';

import { ScenarioContent } from '../types';

export interface FolderStruct {
  id: string;
  name: string;
  children?: FolderStruct[];
  content?: string | Uint8Array;
  isBranch: boolean;
}

export const generateCourseJson = (folderStructure: FolderStruct[]) => {
  // We are just doing one block for now

  const metaFile = folderStructure.find((node) => node.name === 'RC5.yaml');

  if (!metaFile) {
    console.error('No meta file was found');
    return null;
  }

  if (!metaFile?.content) {
    console.error('No content in meta file');
    return null;
  }

  let content: string;

  if (Buffer.isBuffer(metaFile.content)) {
    content = metaFile.content.toString('utf8');
  } else if (typeof metaFile.content === 'string') {
    content = metaFile.content;
  } else {
    console.error(
      'metaFile.content is neither Buffer nor string',
      metaFile.content,
    );
    return null;
  }

  const courseData = YAML.parse(content) as CourseData;

  return generateCourseFromNav(folderStructure, courseData);
};

function contentToString(content: unknown): string {
  if (!content) return '';
  if (Buffer.isBuffer(content)) return content.toString('utf8');
  if (content instanceof Uint8Array)
    return Buffer.from(content).toString('utf8');
  if (typeof content === 'string') return content;
  if (
    (content as any)?.type === 'Buffer' &&
    Array.isArray((content as any).data)
  ) {
    return Buffer.from((content as any).data).toString('utf8');
  }
  return '';
}

/**
 * generate au json from files
 * @param folderStructure
 * @param courseData
 * @returns
 */
export function generateCourseFromNav(
  folderStructure: FolderStruct[],
  courseData: CourseData,
) {
  try {
    // make a flat tree to easily search files
    const flatTree = flattenFolders(folderStructure);
    for (const block of courseData.blocks) {
      for (const au of block.aus) {
        for (const slide of au.slides) {
          const file = flatTree.find((node) =>
            node.id.endsWith(slide.filepath),
          );
          if (file) {
            slide.content = contentToString(file.content);
          }
        }

        let scenarios: ScenarioContent[] = [];
        let teamExerciseConsoles: ScenarioContent[] = [];

        au.slides.map((slide) => {
          //find scenarios
          try {
            scenarios = scenarios.concat(
              getScenarioDirectives(slide.content as string),
            );
          } catch {
            scenarios = [];
          }

          //find team exercise consoles
          try {
            teamExerciseConsoles = teamExerciseConsoles.concat(
              getScenarioDirectives(
                slide.content as string,
                'consoles',
              ) as ScenarioContent[],
            );
          } catch {
            teamExerciseConsoles = [];
          }
        });

        //we only support one scenario
        if (scenarios && scenarios.length > 0) {
          const { uuid, name, promptClass } = scenarios[0] as ScenarioContent;
          au.rangeosScenarioUUID = uuid;
          au.rangeosScenarioName = name;
          au.promptClassId = promptClass;
        }

        //we support multiples, flag sso must be enabled
        au.teamSSOEnabled =
          teamExerciseConsoles && teamExerciseConsoles.length > 0;
      }
    }
    return courseData;
  } catch (err: any) {
    console.error('Could not generate course json');
    throw err;
  }
}

export function flattenFolders(folders: FolderStruct[]): FolderStruct[] {
  const result: FolderStruct[] = [];

  function recurse(folderList: FolderStruct[]) {
    for (const folder of folderList) {
      result.push(folder);
      if (folder.children) {
        recurse(folder.children);
      }
    }
  }

  recurse(folders);
  return result;
}

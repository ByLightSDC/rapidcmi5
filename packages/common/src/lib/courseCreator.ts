import YAML from 'yaml';

import { getScenarioDirectives } from './codeValidators/markdownValidator';
import { CourseData } from './types/course';
import { RC5ScenarioContent, SlideTypeEnum } from './types/slide';
import { TeamConsolesContent } from './types/teamConsoles';

export interface FolderStruct {
  id: string;
  name: string;
  children?: FolderStruct[];
  content?: string | Uint8Array;
  isBranch: boolean;
}

export const RC5_VERSION = '0.0.1';

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
    console.error('metaFile.content is neither Buffer nor string', metaFile.content);
    return null;
  }

  const courseData = YAML.parse(content) as CourseData;

  if (courseData.rc5Version === undefined) courseData.rc5Version = RC5_VERSION;
  return generateCourseFromNav(folderStructure, courseData);
};

function contentToString(content: unknown): string {
  if (!content) return '';
  if (Buffer.isBuffer(content)) return content.toString('utf8');
  if (content instanceof Uint8Array) return Buffer.from(content).toString('utf8');
  if (typeof content === 'string') return content;
  if ((content as any)?.type === 'Buffer' && Array.isArray((content as any).data)) {
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
export function generateCourseFromNav(folderStructure: FolderStruct[], courseData: CourseData) {
  try {
    // make a flat tree to easily search files
    const flatTree = flattenFolders(folderStructure);
    for (const block of courseData.blocks) {
      for (const au of block.aus) {
        for (const slide of au.slides) {
          const file = flatTree.find((node) => node.id.endsWith(slide.filepath));
          if (file) {
            slide.content = contentToString(file.content);
          }
        }

        let scenarios: RC5ScenarioContent[] = [];
        let teamExerciseConsoles: TeamConsolesContent[] = [];

        au.slides.map((slide) => {
          if (slide.type === SlideTypeEnum.Markdown) {
            //find scenarios
            try {
              scenarios = scenarios.concat(getScenarioDirectives(slide.content as string));
            } catch {
              scenarios = [];
            }

            //find team exercise consoles
            try {
              teamExerciseConsoles = teamExerciseConsoles.concat(
                getScenarioDirectives(slide.content as string, 'consoles') as TeamConsolesContent[],
              );
            } catch {
              teamExerciseConsoles = [];
            }
          }
        });

        //we only support one scenario
        if (scenarios && scenarios.length > 0) {
          const { uuid, name, promptClass } = scenarios[0] as RC5ScenarioContent;
          au.rangeosScenarioUUID = uuid;
          au.rangeosScenarioName = name;
          au.promptClassId = promptClass;
        }

        //we support multiples, flag sso must be enabled
        au.teamSSOEnabled = teamExerciseConsoles && teamExerciseConsoles.length > 0;
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

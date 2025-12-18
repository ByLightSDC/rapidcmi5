import path from 'path';
import { generateCmi5Xml } from './generateCmi5Xml';
import { getFolderStructureBackend } from './fileSystem';
import { generateCourseJson } from '@rapid-cmi5/cmi5-build/common';
import { coursePaths } from './constants'
import { XMLParser } from 'fast-xml-parser';

describe('Create CMI5 XML file', () => {
  it('Basic Course generate xml', async () => {
    // Ensure you are using courses that have been tested
    const filePath = path.join(coursePaths.basicCourseNoNav);

    const folderStructure = await getFolderStructureBackend(filePath);

    const courseData = generateCourseJson(folderStructure);
    if (!courseData) {
      console.error('Course data is null');
    } else {
      const cmi5Xml = generateCmi5Xml(courseData);
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
      });
      const parsedXml = parser.parse(cmi5Xml);

      expect(parsedXml.courseStructure).toBeDefined();
      expect(parsedXml.courseStructure.course).toBeDefined();
      expect(parsedXml.courseStructure.course.id).toBe(
        'https://rangeos/default',
      );
      expect(parsedXml.courseStructure.course.title.langstring['#text']).toBe(
        'CBTC - Programming and Scripting',
      );
      expect(parsedXml.courseStructure.block.title.langstring['#text']).toBe(
        'CBTC - Programming and Scripting',
      );
      expect(
        parsedXml.courseStructure.block.au[1].title.langstring['#text'],
      ).toBe('01 Python Fundamentals');
    }
  });
});

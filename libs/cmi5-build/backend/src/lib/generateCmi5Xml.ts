import { CourseData } from '@rangeos-nx/types/cmi5';
import path from 'path';

export function sanitizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

export function generateBlockId(params: {
  courseId: string;
  blockName: string;
}): string {
  const sanitizedBlockName = sanitizeName(params.blockName);
  return `${params.courseId}/${sanitizedBlockName}`;
}

export function generateAuId(params: {
  blockId: string;
  auName: string;
}): string {
  const sanitizedAuName = sanitizeName(params.auName);
  return `${params.blockId}/${sanitizedAuName}`;
}

export function generateCmi5Xml(courseData: CourseData) {
  let cmi5XmlContent = `<?xml version="1.0" encoding="UTF-8"?>
    <courseStructure xmlns="https://w3id.org/xapi/profiles/cmi5/v1/CourseStructure.xsd">
        <course id="${courseData.courseId}">
            <title>
                <langstring lang="en-US">${courseData.courseTitle.replace('_', ' ')}</langstring>
            </title>
            <description>
                <langstring lang="en-US">${courseData.courseDescription}</langstring>
            </description>
        </course>`;

  for (const block of courseData.blocks) {
    const blockId = generateBlockId({
      courseId: courseData.courseId,
      blockName: block.blockName,
    });

    cmi5XmlContent += `
            <block id="${blockId}">
                <title>
                    <langstring lang="en-US">${block.blockName}</langstring>
                </title>
                <description>
                    <langstring lang="en-US">
                        ${block.blockDescription}
                    </langstring>
                </description>`;

    for (const au of block.aus) {
      const auId = generateAuId({ blockId, auName: au.auName });

      // Map moveOnCriteria (lowercase) to CMI5 spec format
      // Or use legacy moveOn field if moveOnCriteria is not set
      let moveOnValue = 'CompletedOrPassed'; // Default
      if (au.moveOnCriteria) {
        const moveOnMap: Record<string, string> = {
          completed: 'Completed',
          passed: 'Passed',
          'completed-and-passed': 'CompletedAndPassed',
          'not-applicable': 'NotApplicable',
        };
        moveOnValue = moveOnMap[au.moveOnCriteria] || 'CompletedOrPassed';
      } else if (au.moveOn) {
        // Use legacy moveOn field (already in correct format)
        moveOnValue = au.moveOn;
      }

      cmi5XmlContent += `
                <au id="${auId}" moveOn="${moveOnValue}">
                    <title>
                        <langstring lang="en-US">${au.auName}</langstring>
                    </title>
                    <description>
                        <langstring lang="en-US">${au.auName}</langstring>
                    </description>
                    <url>compiled_course/blocks/${au.dirPath}/index.html</url>
                </au>`;
    }

    cmi5XmlContent += `
            </block>`;
  }

  cmi5XmlContent += '</courseStructure>';
  cmi5XmlContent = cmi5XmlContent.replace(/&/g, '&amp;');

  return cmi5XmlContent;
}

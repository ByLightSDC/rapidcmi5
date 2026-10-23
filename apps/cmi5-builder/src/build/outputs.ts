import path from 'path';
import fs from 'fs/promises';
import AdmZip from 'adm-zip';
import { CourseData } from '@rapid-cmi5/cmi5-build-common';
import { generateAllAuMappings } from '../commands/generateAuMappings';

export function zipCmi5(cmi5CoursePath: string, zipPath: string) {
  const zip = new AdmZip();
  zip.addLocalFolder(cmi5CoursePath);
  zip.writeZip(zipPath);
  console.log('📦 Zipped output to: ', zipPath);
  return zipPath;
}

export async function generateTfJson(
  courseData: CourseData,
  tfJsonPath: string,
) {
  return generateAllTfJson([courseData], tfJsonPath);
}

export async function generateAllTfJson(
  coursesData: CourseData[],
  tfJsonPath: string,
) {
  console.log('🧱 Generating Terraform JSON AU mapping file...');

  const tfJson = generateAllAuMappings(coursesData);

  const tfOutputDir = path.dirname(tfJsonPath);
  await fs.mkdir(tfOutputDir, { recursive: true });
  await fs.writeFile(tfJsonPath, JSON.stringify(tfJson, null, 2));

  console.log('✅ Terraform AU mapping file written to:', tfJsonPath);
}

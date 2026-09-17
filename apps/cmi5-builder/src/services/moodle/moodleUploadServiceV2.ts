import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
/*
  This upload service will upload to the cmi5 course bank 
  instead of a specific course be default
*/
export interface MoodleUploadServiceV2Deps {
  wstoken: string;
  baseUrl: string;
}

export interface DeployPackageOptions {
  zipPath: string;
  projectIdentifier: string;
  projectName: string;
  /** Optional course IDs to auto-add the activity to */
  deployToCourses?: string[];
}

type MoodleProject = {
  id: number;
  name: string;
  identifier: string;
  currentversion: string;
};

export class MoodleUploadServiceV2 {
  private wstoken: string;
  private baseUrl: string;

  constructor({ wstoken, baseUrl }: MoodleUploadServiceV2Deps) {
    this.wstoken = wstoken;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async listProjects(): Promise<MoodleProject[]> {
    const url = `${this.baseUrl}/webservice/rest/server.php`;

    const params = new URLSearchParams({
      wstoken: this.wstoken,
      wsfunction: 'local_rapidcmi5_list_projects',
      moodlewsrestformat: 'json',
      limit: '100',
      offset: '0',
    });

    const response = await axios.post(url, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return response.data?.projects ?? [];
  }

  private bumpVersion(version: string): string {
    const parts = version.split('.').map(Number);
    parts[2] = (parts[2] ?? 0) + 1;
    return parts.join('.');
  }

  private async uploadFile(zipPath: string): Promise<number> {
    const url = `${this.baseUrl}/webservice/upload.php`;

    const formData = new FormData();
    formData.append('token', this.wstoken);
    formData.append('filearea', 'draft');
    formData.append('file_1', fs.createReadStream(zipPath), {
      filename: path.basename(zipPath),
    });

    const response = await axios.post(url, formData, {
      headers: formData.getHeaders(),
    });

    const data = response.data;
    const item = Array.isArray(data) ? data[0] : data;

    if (!item || item.itemid === undefined) {
      throw new Error(
        `Upload did not return an itemid: ${JSON.stringify(data)}`,
      );
    }

    return item.itemid as number;
  }

  private async deployPackage(
    itemid: number,
    options: DeployPackageOptions,
    version: string,
  ): Promise<unknown> {
    const url = `${this.baseUrl}/webservice/rest/server.php`;

    const params = new URLSearchParams({
      wstoken: this.wstoken,
      wsfunction: 'local_rapidcmi5_deploy_package',
      moodlewsrestformat: 'json',
      draftitemid: String(itemid),
      project_identifier: options.projectIdentifier,
      project_name: options.projectName,
      version,
    });

    if (options.deployToCourses) {
      options.deployToCourses.forEach((courseId, i) => {
        params.append(`deploy_to_courses[${i}]`, courseId);
      });
    }

    const response = await axios.post(url, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return response.data;
  }

  public async uploadCourse(options: DeployPackageOptions): Promise<unknown> {
    const projects = await this.listProjects();
    const existing = projects.find(
      (p) => p.identifier === options.projectIdentifier,
    );

    const version = existing
      ? this.bumpVersion(existing.currentversion)
      : '1.0.0';

    if (existing) {
      console.log(
        `Found existing project "${existing.identifier}" at v${existing.currentversion}, deploying as v${version}`,
      );
    } else {
      console.log(
        `No existing project for identifier "${options.projectIdentifier}", creating at v${version}`,
      );
    }

    console.log(`Uploading file: ${options.zipPath}`);
    const itemid = await this.uploadFile(options.zipPath);
    console.log(`File uploaded, itemid: ${itemid}`);

    const result = await this.deployPackage(itemid, options, version);
    console.log('Package deployed:', result);

    return result;
  }
}

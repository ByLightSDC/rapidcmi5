import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { AuMappingService } from '../auMappingService';
import { CourseData } from '@rapid-cmi5/cmi5-build-common';
import FormData from 'form-data';
import fs from 'fs';
export interface OpendashCmi5Course {
  identifier: string;
  name: string;
  description: string;
  provider: string;
  enrollmentType: string;
  pacing: string;
  venue: string;
  status: string;
  classification: string;
  countryOfOrigin: string;
  publisher: string;
}

export interface OpenDashImport {
  dirpath: string;
  filename: string;
  courseId: string;
  moduleIndex: number;
}

export interface OpendashUploadServiceDeps {
  baseUrl: string;
  jwt: string;
  useRealAuid: boolean;
}

export class OpendashUploadService {
  private jwt: string;
  private baseUrl: string;
  private provider = '84ed0282-9f49-48a4-9a01-c51e871b9ef9';
  private enrollmentType = 'SelfEnroll';
  private venue = 'Online';
  private publisher = 'PCTE/DoD/USCC/PCTE Program Management/Vendors/Metova';
  private classification = 'UNCLASSIFIED';
  private status = 'published';
  private countryOfOrigin = 'US';
  private pacing = 'SelfPaced';
  private useRealAuid: boolean;

  constructor({ jwt, baseUrl, useRealAuid }: OpendashUploadServiceDeps) {
    this.jwt = jwt;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // remove trailing slash if any

    this.useRealAuid = useRealAuid;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.jwt}`,
    };
  }

  private async getAllCourses(searchName: string) {
    const url = `${this.baseUrl}/service-arch-api/v1/activities`;
    const response = await axios.get(url, {
      headers: this.headers,
      params: {
        $skip: 0,
        $take: 10,
        $search: searchName,
        $orderBy: 'name asc',
      },
    });
    return response?.data;
  }

  private async getCourse(uuid: string) {
    const url = `${this.baseUrl}/service-arch-api/cms/v1/courses/${uuid}`;
    const response = await axios.get(url, { headers: this.headers });
    const { id, queueName } = response.data ?? {};
    if (id && queueName) {
      const jobData = await this.checkJobStatus(id, queueName);
      return jobData.data;
    }
    return null;
  }

  private async createCourse(course: OpendashCmi5Course) {
    const url = `${this.baseUrl}/service-arch-api/cms/v1/courses`;
    const response = await axios.post(url, course, {
      headers: { ...this.headers, 'Content-Type': 'application/json' },
    });
    const { id, queueName } = response.data ?? {};
    if (id && queueName) {
      const jobData = await this.checkJobStatus(id, queueName);
      return jobData.data;
    }
    return response.data;
  }

  private async publishCourse(uuid: string) {
    const url = `${this.baseUrl}/service-arch-api/cms/v1/courses/${uuid}/publish`;
    const response = await axios.post(url, {}, { headers: this.headers });
    const { id, queueName } = response.data ?? {};
    if (id && queueName) {
      const jobData = await this.checkJobStatus(id, queueName);
      return jobData.data;
    }
  }

  private async importCmi5Archive(data: OpenDashImport) {
    const url = `${this.baseUrl}/service-arch-api/activity-registry/v1/cmi5/import`;
    const response = await axios.post(url, data, {
      headers: { ...this.headers, 'Content-Type': 'application/json' },
    });
    const { id, queueName } = response.data ?? {};
    if (id && queueName) {
      const jobData = await this.checkJobStatus(id, queueName);
      return jobData.data;
    }
  }

  private async checkJobStatus(
    jobId: string,
    queueName: string,
    maxRetries = 5,
    delay = 2000,
  ) {
    for (let attempts = 0; attempts < maxRetries; attempts++) {
      try {
        const res = await axios.get(
          `${this.baseUrl}/service-arch-api/jobs/${queueName}/${jobId}`,
          { headers: this.headers },
        );

        const { progress = 0, state } = res.data ?? {};
        if (state === 'failed') {
          throw new Error(`Job ${jobId} in queue "${queueName}" failed.`);
        }

        if (progress >= 100 || state === 'completed') {
          console.log('✅ Job completed!');
          return res.data;
        }

        await new Promise((r) => setTimeout(r, delay));
      } catch (err: any) {
        if (err.code === 'ECONNRESET') {
          console.warn(`Retrying (${jobId}): ECONNRESET`);
          continue;
        }
        if (err.status === 404) {
          console.warn(`Retrying Job not found: ${jobId}`);
          continue;
        }
        throw new Error(
          `Failed to check job status for ${jobId}: ${err.message}`,
        );
      }
    }
    throw new Error(
      `Job ${jobId} did not complete after ${maxRetries} attempts`,
    );
  }

  private async uploadNewOpendash(zipPath: string) {
    await this.uploadCmi5(zipPath);

    console.log('Successfully uploaded course');
  }

  private async uploadCmi5(zipPath: string) {
    try {
      const url = `${this.baseUrl}/service-arch-api/v2/lms/courses/import/cmi5`;
      const form = new FormData();
      form.append('file', fs.createReadStream(zipPath));
      form.append('overwrite', 'false');
      await axios.post(url, form, {
        headers: { ...this.headers, ...form.getHeaders() },
      });
    } catch (error) {
      new Error(`Error uploading file to opendash failed. ${error}`);
    }
  }

  public async uploadCourse(
    courseData: CourseData,
    auMappingService: AuMappingService,
    zipPath: string,
    applyAuMappings = false,
  ) {
    let existingCourse;
    try {
      const allCourses = await this.getAllCourses(courseData.courseTitle);
      existingCourse = allCourses?.data?.find(
        (c: any) => c.name === courseData.courseTitle,
      );
    } catch (error) {
      console.error(
        'Could not get courses',
        this.jwt,
        this.baseUrl,
        courseData.courseTitle,
      );
      return;
    }

    if (existingCourse) {
      console.log('Course already exists:', existingCourse.identifier);
      if (applyAuMappings) {
        if (this.useRealAuid) {
          await auMappingService.resolveAllAus(courseData, this.baseUrl);
        } else {
          await auMappingService.resolveAllAus(
            courseData,
            this.baseUrl,
            existingCourse.identifier,
          );
        }
      }
      return;
    }

    this.uploadNewOpendash(zipPath);
    if (applyAuMappings) {
      await auMappingService.resolveAllAus(courseData, this.baseUrl);
    }
  }
}

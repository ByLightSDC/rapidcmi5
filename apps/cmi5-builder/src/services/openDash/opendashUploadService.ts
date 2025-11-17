import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { AuMappingService } from '../auMappingService';
import { CourseData } from '@rangeos-nx/types/cmi5';
import { AllowedNamespaces, UploadService } from './multiPartUploadService';
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
  private uploadService: UploadService;
  private useRealAuid: boolean;

  constructor({ jwt, baseUrl, useRealAuid }: OpendashUploadServiceDeps) {
    this.jwt = jwt;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // remove trailing slash if any
    this.uploadService = new UploadService({
      baseUrl: this.baseUrl,
      token: jwt,
    });

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

  private async uploadOldOpendash(courseData: CourseData, zipPath: string) {
    const newUUID = uuidv4();

    let cmsData = await this.getCourse(newUUID);

    if (!cmsData) {
      console.log('Creating new course in OpenDash...');

      cmsData = {
        identifier: newUUID,
        name: courseData.courseTitle,
        description: courseData.courseTitle,
        provider: this.provider,
        enrollmentType: this.enrollmentType,
        venue: this.venue,
        publisher: this.publisher,
        classification: this.classification,
        status: this.status,
        countryOfOrigin: this.countryOfOrigin,
        pacing: this.pacing,
      };
      await this.createCourse(cmsData);
    }

    await this.publishCourse(newUUID);

    const uploadResults = await this.uploadService.upload({
      filePaths: [zipPath],
      namespace: AllowedNamespaces.UPLOADS,
      labId: 'ros-cbtc',
    });

    await Promise.all(
      uploadResults.map(async (course: any) => {
        try {
          await this.importCmi5Archive({
            dirpath: course.dirpath,
            filename: course.filename,
            courseId: newUUID,
            moduleIndex: 0,
          });
        } catch (err) {
          console.error('❌ Import error:', err);
        }
      }),
    );

    console.log('✅ Uploaded and imported. Course UUID:', newUUID);
    return newUUID;
  }

  private async uploadNewOpendash(zipPath : string) {

    await this.uploadCmi5(zipPath)

    console.log("Successfully uploaded course")
  }


  private async uploadCmi5(zipPath: string) {

    try {
      const url = `${this.baseUrl}/service-arch-api/v2/lms/courses/import/cmi5`;
      const form = new FormData();
      form.append('file', fs.createReadStream(zipPath));
      form.append('overwrite', "false");
      await axios.post(url, form, {
        headers: { ...this.headers, ...form.getHeaders() },
      });
    } catch (error) {
      new Error(`Error uploading file to opendash failed. ${error}`,); 
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

    if (this.useRealAuid) {
      this.uploadNewOpendash(zipPath);
      if (applyAuMappings) {
        await auMappingService.resolveAllAus(courseData, this.baseUrl);
      }
    } else {
      const newUUID = await this.uploadOldOpendash(courseData, zipPath);
      if (applyAuMappings) {
        await auMappingService.resolveAllAus(courseData, this.baseUrl, newUUID);
      }
    }
  }
}

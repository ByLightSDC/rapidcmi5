import {
  DeployedScenario,
  ScenariosDeployRequest,
} from '@rangeos-nx/frontend/clients/devops-api';

export interface LooseObject {
  [key: string]: any;
}

/** Mock Types
 *
 **/

export interface Assessment {
  name: string;
  description: string;
  uuid: string;
  objectives: Objective[];
  resources: string[];
}

export interface Objective {
  order?: string;
  alias?: string;
  name: string;
  description?: string;
  //au: 'aaa';
  scale?: string;
  criterion?: string;
  status?: string;
  comment?: string;
}

export interface AssessmentCreate {
  name: string;
  description: string;
  uuid: string;
  objectives: any[];
  resources: string[];
}

export interface AssessmentUpdate {
  name: string;
  description: string;
  uuid: string;
  objectives: any[];
  resources: string[];
}

export interface Cmi5Class {
  uuid: string;
  name: string;
  author: string;
  rangeId: string;
}

export interface Cmi5Scenario extends DeployedScenario {
  assigned?: boolean;
  classId?: string;
  studentId?: string;
  studentUsername?: string;
}

export interface Cmi5ScenarioRequest extends ScenariosDeployRequest {
  name?: string;
}

export interface LiveActionEventCreate {
  name: string;
  description: string;
  assessment?: string;
  resourceScenario?: string;
  scenario?: string;
}

export interface LiveActionEvent {
  name?: string;
  description?: string;
  uuid?: string;
  rangeResource?: string;
  assessment?: string;
  range?: string;
  resourceScenario?: string;
  scenario?: string;
  status?: EventStatusEnum;
}

export interface LiveActionEventUpdate {
  name: string;
  description: string;
  assessment?: string;
  resourceScenario?: string;
  scenario?: string;
}

export interface EventResource {
  author?: string;
  description?: string;
  dateCreated?: string;
  dateEdited?: string;
  size?: number;
  resourceType?: string;
  name?: string;
  uuid?: string;
}

export type EventResourceCreate = {
  name?: string;
  description?: string;
  resourceType?: string;
  file?: any;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
};

export interface EventResourceUpdate {
  name?: string;
  description?: string;
  resourceType?: string;
}

export interface JoinedParticipant {
  dateCreated?: string;
  email?: string;
  name?: string;
  roles?: string[];
  userName?: string;
  uuid?: string;
}

export interface Resource {
  author?: string;
  description?: string;
  dateCreated?: string;
  dateEdited?: string;
  size?: number;
  resourceType?: string;
  name?: string;
  uuid?: string;
}

export type ResourceCreate = {
  name?: string;
  description?: string;
  resourceType?: string;
  file?: any;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
};

export interface ResourceUpdate {
  name?: string;
  description?: string;
  resourceType?: string;
}

export interface ScoreCard {
  name?: string;
  description?: string;
  uuid?: string;
  assessment?: string;
  event?: string;
  status?: EventStatusEnum;
  objectives?: any[];
  numPassed?: number;
  numCompleted?: number;
  numFailed?: number;
  numStarted?: number;
}

export interface ScoreCardUpdate {
  objectives?: any[];
}

//#region Enums

export enum EventStatusEnum {
  Unknown = 'Unknown',
  Ready = 'Ready',
  Deployed = 'Deployed',
  Started = 'Started',
  Paused = 'Paused',
  Stopped = 'Stopped',
  Error = 'Error',
  Starting = 'Starting',
  Pausing = 'Pausing',
  Stopping = 'Stopping',
  Deleting = 'Deleting',
}

export enum ScaleEnum {
  Minutes = 'Minutes',
  Hours = 'Hours',
  Days = 'Days',
  YN = 'Y/N',
}

export enum ObjectiveStatusEnum {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Passed = 'Passed',
  Failed = 'Failed',
  Completed = 'Completed',
}

//#endregion Enums

/**
 * Activity Status State Types
 *
 * This file defines the types for tracking individual activity completion and passing status
 * in the LRS Activity State system.
 */

import { ActivityScore } from '@rapid-cmi5/cmi5-build/common';

export interface SlideActivityScore {
  raw: number;
  min: number;
  max: number;
  scaled?: number;
}

export interface ActivityScoringParams {
  activityData: ActivityScore;
  slideGuid: string | null; // Can be null - function will determine it
  slideIndex: number;
}
export interface SlideActivityStatus {
  type: ActivityType;
  slideIndex: number;
  slideGuid: string;
  completed: boolean;
  passed: boolean;
  completedAt?: string;
  passedAt?: string;
  score?: SlideActivityScore;
  metadata?: Record<string, unknown>;
  meetsCriteria?: boolean;
}

export interface SlideActivityStatusState {
  [activityId: string]: SlideActivityStatus;
}

// Store ID for Activity Status State
export const ACTIVITY_STATUS_STORE_ID = '/states/activityStatus';

// Activity types enum for type safety
export enum SlideActivityType {
  QUIZ = 'quiz',
  CTF = 'ctf',
  AUTOGRADER = 'autograder',
  SCENARIO = 'scenario',
  JOBE = 'jobe',
  CONSOLES = 'consoles',
  UNKNOWN = 'unknown',
}

// Legacy type alias for backward compatibility
export type ActivityType = SlideActivityType;

// Legacy constant for backward compatibility (deprecated - use SlideActivityType enum instead)
export const SLIDE_ACTIVITY_TYPES = Object.values(SlideActivityType);

// Helper type for activity completion payload
export interface ActivityCompletionPayload {
  activityId: string;
  slideIndex: number;
  slideGuid: string;
  type: ActivityType;
  score?: SlideActivityScore;
  metadata?: Record<string, unknown>;
  meetsCriteria?: boolean;
}

// Helper type for activity passing payload
export interface ActivityPassingPayload {
  activityId: string;
  score?: SlideActivityScore;
  metadata?: Record<string, unknown>;
}

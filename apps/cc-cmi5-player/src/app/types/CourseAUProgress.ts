/**
 * CourseAUProgress Types
 *
 * This file defines the types for the consolidated AU progress tracking system
 * that serves as the global source of truth for all progress data.
 */

import { CourseAU } from '@rapid-cmi5/cmi5-build/common';
import { ActivityType, SlideActivityStatus } from './SlideActivityStatusState';

// Slide identification using filepath as GUID
export interface SlideIdentifier {
  slideIndex: number; // For backward compatibility
  slideGuid: string; // filepath value (e.g., "MattQuiz/introduction/01-slide.md")
  slideTitle: string; // Human readable title
}

// KSAT element structure (from markdown content)
export interface KSATElement {
  element_type: 'task' | 'knowledge' | 'skill';
  element_identifier: string;
  title: string;
  text: string;
  doc_identifier: string;
}

// Activity metadata (parsed from markdown content)
export interface SlideActivityMetadata {
  type: ActivityType;
  completionRequired: string; // "passed" or other criteria
  passingScore?: number; // e.g., 80
  questions?: unknown[]; // Question data from markdown
  ksats?: Array<KSATElement>; // Array of KSAT elements
}

// Slide status tracking
export interface SlideStatus {
  viewed: boolean;
  audioCompleted?: boolean;
  scrolledToBottom?: boolean;
  completed: boolean; // Slide is completed (either no activities + viewed, or all activities completed)
  passed: boolean; // Slide is passed (either no activities + viewed, or all activities passed)
  failed: boolean; // Slide has failed (at least one activity has failed)
}

// Course structure information
export interface CourseStructure {
  auId: string;
  auTitle: string;
  totalSlides: number;
  slides: SlideIdentifier[];
  // CMI5 moveOn rule for this AU
  moveOn?:
    | 'Passed'
    | 'Completed'
    | 'CompletedAndPassed'
    | 'CompletedOrPassed'
    | 'NotApplicable';
}

// Progress tracking (consolidated from scattered fields)
export interface ProgressTracking {
  // AU-level progress
  auProgress: number; // 0-100 (existing auProgress field)
  auCompleted: boolean;
  auPassed: boolean;

  totalProgressSteps: number; // total slides + num activities with gradeable activity

  // Slide-level tracking
  // Note: currentSlide is now tracked in navigationSlice.activeTab (source of truth)
  // viewedSlides: number[]; // (existing auViewedSlides field) - COMMENTED OUT
  slideStatus: {
    [slideGuid: string]: SlideStatus;
  };

  // Activity-level tracking
  activityStatus: {
    [activityId: string]: SlideActivityStatus;
  };
}

// Main CourseAUProgress object
export interface CourseAUProgress {
  // Course structure (from auJson)
  courseStructure: CourseStructure;

  // Slide activity metadata (parsed at runtime)
  slideActivitiesMeta: {
    [slideGuid: string]: {
      [activityId: string]: SlideActivityMetadata;
    };
  };

  // Progress tracking (consolidated from scattered fields)
  progress: ProgressTracking;

  // Metadata
  lastUpdated: string;
  version: string;
}

// Helper type for creating CourseAUProgress from existing data
export interface CourseAUProgressInit {
  auJson: CourseAU;
  auProgress?: number;
  auViewedSlides?: number[];
  // Note: currentSlide is now tracked in navigationSlice.activeTab
}

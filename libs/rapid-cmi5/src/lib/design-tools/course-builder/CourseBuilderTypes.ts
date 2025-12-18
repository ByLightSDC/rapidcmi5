import { Topic } from '@rapid-cmi5/ui/api/hooks';

export enum ViewModeEnum {
  Designer = 'Designer',
  CodeEditor = 'Code Editor',
  FormEditor = 'Form Editor',
  GitEditor = 'Git Editor',
}

/**
 * @enum MessageType
 */
export enum MessageType {
  cancelForm = 'cancelForm',
  saveCourse = 'saveCourse',
  saveForm = 'saveForm',
  navigate = 'navigate',
  changeCourse = 'changeCourse',
  changeLesson = 'changeLesson',
  createCourse = 'createCourse',
  downloadCourseZip = 'downloadCourseZip',
  remountLesson = 'remountLesson',
  changeCourseSettings = 'changeCourseSettings',
}

/**
 * @typedef {Object} Message
 * @property {string} type MessageType
 * @property {string} [meta] Additional information based on message type
 * @property {string} [event] Mouse Event Associated with message
 */
export type Message = {
  type: string;
  meta?: any;
  event?: any;
  topicId?: Topic;
};

/**
 * @interface IDesignerContext
 * @property {boolean} isEnabled
 * @property {(message: Message) => void} sendMessage
 */
export interface IDesignerContext {
  isEnabled: boolean;
  sendMessage: (message: Message) => void;
}

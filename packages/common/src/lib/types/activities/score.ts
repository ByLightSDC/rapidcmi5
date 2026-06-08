import { ActivityContent, RC5ActivityTypeEnum } from './activity';
import { CodeRunnerSubmitResponse } from './codeRunner';
import { QuizScore } from './quiz';
import { ScenarioSubmitResponse } from './scenario';

/**
 * @typedef {Object} SlideType
 * @property {SlideTypeEnum} type Slide Type
 * @property {string | ScenarioContent | QuizContent | CTFContent | CodeRunnerContent} content Activity Content
 * @property {*} scoreData Score
 */
export type ActivityScore = {
  activityType: RC5ActivityTypeEnum;
  activityContent: ActivityContent;
  scoreData?: QuizScore | CodeRunnerSubmitResponse | ScenarioSubmitResponse;
};

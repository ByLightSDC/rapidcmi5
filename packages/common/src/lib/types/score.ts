import { type RC5ActivityTypeEnum } from './activity';
import { type CodeRunnerContent, type CodeRunnerSubmitResponse } from './codeRunner';
import { type CTFContent } from './ctf';
import { type QuizContent, type QuizScore } from './quiz';
import { type ScenarioContent, type ScenarioSubmitResponse } from './slide';
import { type TeamConsolesContent } from './teamConsoles';

/**
 * @typedef {Object} SlideType
 * @property {SlideTypeEnum} type Slide Type
 * @property {string | ScenarioContent | QuizContent | CTFContent | CodeRunnerContent} content Activity Content
 * @property {*} scoreData Score
 */
export type ActivityScore = {
  activityType: RC5ActivityTypeEnum;
  activityContent:
    | CTFContent
    | QuizContent
    | CodeRunnerContent
    | ScenarioContent
    | TeamConsolesContent;
  scoreData?: QuizScore | CodeRunnerSubmitResponse | ScenarioSubmitResponse;
};

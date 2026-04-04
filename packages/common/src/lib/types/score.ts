import { RC5ActivityTypeEnum } from './activity';
import { CodeRunnerContent, CodeRunnerSubmitResponse } from './codeRunner';
import { CTFContent } from './ctf';
import { QuizContent, QuizScore } from './quiz';
import { ScenarioContent, ScenarioSubmitResponse } from './slide';
import { TeamConsolesContent } from './teamConsoles';

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

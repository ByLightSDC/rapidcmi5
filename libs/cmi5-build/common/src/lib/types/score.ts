import { RC5ActivityTypeEnum } from './activity';
import { CTFContent } from './ctf';
import { JobeContent, JobeSubmitResponse } from './jobe';
import { QuizContent, QuizScore } from './quiz';
import { ScenarioContent, ScenarioSubmitResponse } from './slide';
import { TeamConsolesContent } from './teamConsoles';

/**
 * @typedef {Object} SlideType
 * @property {SlideTypeEnum} type Slide Type
 * @property {string | ScenarioContent | QuizContent | CTFContent | JobeContent} content Activity Content
 * @property {*} scoreData Score
 */
export type ActivityScore = {
  activityType: RC5ActivityTypeEnum;
  activityContent:
    | CTFContent
    | QuizContent
    | JobeContent
    | ScenarioContent
    | TeamConsolesContent;
  scoreData?: QuizScore | JobeSubmitResponse | ScenarioSubmitResponse;
};

import ctfSchema from './schemas/CTFContent.schema.json';
import downloadFilesSchema from './schemas/DownloadFilesContent.schema.json';
import jobeSchema from './schemas/JobeContent.schema.json';
import quizSchema from './schemas/QuizContent.schema.json';
import scenarioSchema from './schemas/RC5ScenarioContent.schema.json';
import teamConsolesSchema from './schemas/RC5ScenarioContent.schema.json';

export const DownloadFilesSchema = downloadFilesSchema;
export const QuizContentSchema = quizSchema;
export const ScenarioContentSchema = scenarioSchema;
export const TeamConsolesContentSchema = teamConsolesSchema;
export const CTFContentSchema = ctfSchema;
export const JobeContentSchema = jobeSchema;

export * from './lib/activity';
export * from './lib/admonition';
export * from './lib/course';
export * from './lib/ctf';
export * from './lib/download';
export * from './lib/jobe';
export * from './lib/player';
export * from './lib/score';
export * from './lib/quiz';
export * from './lib/slide';
export * from './lib/teamConsoles';

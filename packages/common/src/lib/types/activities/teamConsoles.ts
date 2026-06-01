import { BaseActivity } from './activities/activity';

/**
 * Team Exercise Consoles
 */
export type TeamConsolesContent = BaseActivity & {
  uuid: string;
  name: string;
};

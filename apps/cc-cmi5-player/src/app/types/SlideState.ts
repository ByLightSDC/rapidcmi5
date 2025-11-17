export type State = {
  currentSlide?: number;
  slides?: Array<number>;
};

export type StateInitStatement = {
  initStatement?: string;
};

export type InitScenarioResponse = {
  classId?: string;
  deployedScenarios: Array<string>;
  rangeId: string;
};

export type ScenarioConsolesResponse = Array<{
  username: string;
  password: string;
}>;

// This is an array of slides which has been viewed by the browser, it is per AU and
// persists through refresh and relaunch
export const stateViewedSlides = '/states/viewedSlides';

// This is the base of tracking current answers for a quiz, appended to the end will be
// the slide and quiz id as well
// It is sepearate from current question as there is no update function, we must replace the whole json
// data when adding or changing an answer to a question
export const stateQuizCurrentAnswers = '/states/quizProgress/currentAnswers';
// Tracks only the current question a quiz is on, has the same slide and quiz id appended to the end
export const stateQuizCurrentQuestion = '/states/quizProgress/currentQuesion';

export const stateInitStatement = '/states/initStatement';

/**
 * Represents the status changes that occurred when updating a slide's status
 */
export type SlideChangedStatus = {
  wasCompleted: boolean;
  wasPassed: boolean;
  isNowCompleted: boolean;
  isNowPassed: boolean;
};

import { test, expect } from '../fixtures/moodle-course-fixture';

/**
 * Quiz activity tests — the Quiz:Basic lesson (one :::quiz slide = tab-0).
 *
 * **KEY DIFFERENCE from the synthetic suite:** the player-e2e version relied
 * on `?fetch=test` → isTestMode, which let the quiz render/score WITHOUT a
 * real LRS. Under a real Moodle launch there is NO `fetch=test` — the quiz
 * hydrates and reports against the LIVE LRS. So:
 *   - hydration may be slower → generous timeouts.
 *   - submitting posts real xAPI statements; re-running against a persistent
 *     registration may hit "already answered" state. If the interaction tests
 *     prove flaky, they likely need a fresh registration per run.
 *
 * Render tests are safe; interaction tests (@quiz-interaction) reach into L2.
 */

const QUIZ_SLIDE = 'player-slide-tab-0';

test.describe('test basic quiz  @quizzes', () => {
  test.use({ auName: 'Quiz:Basic' });

  test('renders the activity directive', async ({ player }) => {
    await player.getByTestId(QUIZ_SLIDE).click();
    await expect(
      player
        .getByTestId('player-slide-content')
        .getByTestId('directive-activity'),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('tags the activity with type=quiz', async ({ player }) => {
    await player.getByTestId(QUIZ_SLIDE).click();
    await expect(
      player
        .getByTestId('player-slide-content')
        .getByTestId('directive-activity'),
    ).toHaveAttribute('data-activity-type', 'quiz');
  });

  test('renders the AuQuiz body', async ({ player }) => {
    await player.getByTestId(QUIZ_SLIDE).click();
    await expect(
      player.getByTestId('player-slide-content').getByTestId('activity-quiz'),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('shows the fixture quiz title', async ({ player }) => {
    await player.getByTestId(QUIZ_SLIDE).click();
    const quizBody = player
      .getByTestId('player-slide-content')
      .getByTestId('activity-quiz');
    await expect(quizBody.getByRole('heading', { name: 'Quiz' })).toBeVisible();
  });

  test('shows the fixture question text', async ({ player }) => {
    await player.getByTestId(QUIZ_SLIDE).click();
    await expect(
      player
        .getByTestId('player-slide-content')
        .getByText('What color is blue'),
    ).toBeVisible({ timeout: 15_000 });
  });

  /**
   * Interaction tests — submit against the REAL LRS. Tagged
   * @quiz-interaction so they can be excluded from the stable lane.
   */
  test('submit correct answer → score is 100% @quiz-interaction', async ({
    player,
  }) => {
    await player.getByTestId(QUIZ_SLIDE).click();

    const slideContent = player.getByTestId('player-slide-content');
    await expect(slideContent.getByText('What color is blue')).toBeVisible({
      timeout: 15_000,
    });

    await slideContent.getByPlaceholder('Your Answer...').fill('blue');

    const submitButton = slideContent.getByRole('button', { name: 'Submit' });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    await expect(slideContent.getByText('Your Score: 100%')).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      slideContent.getByRole('button', { name: 'Review Answers' }),
    ).toBeVisible();
    await expect(
      slideContent.getByRole('button', { name: 'Try Again' }),
    ).toBeVisible();
  });

  test('submit incorrect answer → score is 0% @quiz-interaction', async ({
    player,
  }) => {
    await player.getByTestId(QUIZ_SLIDE).click();

    const slideContent = player.getByTestId('player-slide-content');
    await expect(slideContent.getByText('What color is blue')).toBeVisible({
      timeout: 15_000,
    });

    await slideContent.getByPlaceholder('Your Answer...').fill('red');

    const submitButton = slideContent.getByRole('button', { name: 'Submit' });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    await expect(slideContent.getByText('Your Score: 0%')).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      slideContent.getByRole('button', { name: 'Try Again' }),
    ).toBeVisible();
  });

  test('Review Answers surfaces the correct-answer hint @quiz-interaction', async ({
    player,
  }) => {
    await player.getByTestId(QUIZ_SLIDE).click();

    const slideContent = player.getByTestId('player-slide-content');
    await slideContent.getByPlaceholder('Your Answer...').fill('red');
    await slideContent.getByRole('button', { name: 'Submit' }).click();

    await expect(slideContent.getByText('Your Score: 0%')).toBeVisible({
      timeout: 15_000,
    });

    await slideContent.getByRole('button', { name: 'Review Answers' }).click();

    await expect(
      slideContent.getByText('The Correct Answer is blue'),
    ).toBeVisible({ timeout: 15_000 });
  });
});

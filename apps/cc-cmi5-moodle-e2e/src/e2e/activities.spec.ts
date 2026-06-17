import { test, expect } from '../fixtures/moodle-course-fixture';

/**
 * Activity (quiz) tests — ported from cc-cmi5-player-e2e to run against a
 * real Moodle launch.
 *
 * **KEY DIFFERENCE from the synthetic suite:** the player-e2e version relied
 * on `?fetch=test` → `checkForDevMode()` → `isTestMode=true`, which let the
 * quiz render/score WITHOUT a real LRS. Under a real Moodle launch there is
 * NO `fetch=test` — the quiz hydrates and reports against the LIVE LRS.
 *
 * This is the whole point of this tier (it exercises the real cmi5 session),
 * but it means:
 *   - hydration may be slower → generous timeouts.
 *   - submitting an answer posts real xAPI statements; re-running the same
 *     test against a persistent learner/registration may hit "already
 *     answered" state. If the score/interaction tests prove flaky against a
 *     real LRS, they likely need a fresh registration per run (provisioning)
 *     or should be split into a separate, opt-in suite.
 *
 * The render tests (directive present, type=quiz, AuQuiz body, question
 * text) are safe regardless. The interaction tests (submit → score) are
 * marked and may need the above follow-up.
 *
 * **L3 scope** for render tests; the interaction tests reach into L2.
 */

test.describe('quiz activity @activities', () => {
  test('Quiz slide renders the activity directive', async ({ player }) => {
    await player.getByTestId('player-slide-tab-6').click();

    const activity = player
      .getByTestId('player-slide-content')
      .getByTestId('directive-activity');
    await expect(activity).toBeVisible({ timeout: 15_000 });
  });

  test('Quiz slide tags the activity with type=quiz', async ({ player }) => {
    await player.getByTestId('player-slide-tab-6').click();

    const activity = player
      .getByTestId('player-slide-content')
      .getByTestId('directive-activity');
    await expect(activity).toHaveAttribute('data-activity-type', 'quiz');
  });

  test('Quiz slide renders the AuQuiz body', async ({ player }) => {
    await player.getByTestId('player-slide-tab-6').click();

    const quizBody = player
      .getByTestId('player-slide-content')
      .getByTestId('activity-quiz');
    await expect(quizBody).toBeVisible({ timeout: 15_000 });
  });

  test('Quiz slide shows the fixture quiz title', async ({ player }) => {
    await player.getByTestId('player-slide-tab-6').click();

    const quizBody = player
      .getByTestId('player-slide-content')
      .getByTestId('activity-quiz');
    await expect(
      quizBody.getByRole('heading', { name: 'Quiz' }),
    ).toBeVisible();
  });

  test('Quiz slide shows the fixture question text', async ({ player }) => {
    await player.getByTestId('player-slide-tab-6').click();

    const slideContent = player.getByTestId('player-slide-content');
    await expect(slideContent.getByText('What color is blue')).toBeVisible({
      timeout: 15_000,
    });
  });

  /**
   * Interaction tests — submit against the REAL LRS. See file header: these
   * may need a fresh registration per run if they prove flaky. Tagged
   * @quiz-interaction so they can be excluded from the stable lane.
   */
  test('Quiz: submit correct answer → score is 100% @quiz-interaction', async ({
    player,
  }) => {
    await player.getByTestId('player-slide-tab-6').click();

    const slideContent = player.getByTestId('player-slide-content');
    await expect(slideContent.getByText('What color is blue')).toBeVisible({
      timeout: 15_000,
    });

    const answerInput = slideContent.getByPlaceholder('Your Answer...');
    await answerInput.fill('blue');

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

  test('Quiz: submit incorrect answer → score is 0% @quiz-interaction', async ({
    player,
  }) => {
    await player.getByTestId('player-slide-tab-6').click();

    const slideContent = player.getByTestId('player-slide-content');
    await expect(slideContent.getByText('What color is blue')).toBeVisible({
      timeout: 15_000,
    });

    const answerInput = slideContent.getByPlaceholder('Your Answer...');
    await answerInput.fill('red');

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

  test('Quiz: Review Answers surfaces the correct-answer hint @quiz-interaction', async ({
    player,
  }) => {
    await player.getByTestId('player-slide-tab-6').click();

    const slideContent = player.getByTestId('player-slide-content');
    const answerInput = slideContent.getByPlaceholder('Your Answer...');
    await answerInput.fill('red');
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

import { test, expect } from '../fixtures/e2e-tests-course-fixture';

/**
 * Activity tests against the player.
 *
 * Activities (Quiz / CTF / CodeRunner / Scenario / Consoles / Download)
 * are authored as MDX directives — e.g. `:::quiz` — not as separate
 * slide types. The player's `ActivityPlayback` component matches the
 * directive name against `ActivityType` and renders the appropriate
 * subcomponent (AuQuiz, AuCTF, CodeRunner, ScenarioConsoles, etc.).
 *
 * The activity root carries:
 *   - `data-testid="directive-activity"` (constant)
 *   - `data-activity-type="<name>"` (varies: 'quiz', 'codeRunner', etc.)
 *
 * Each activity subcomponent also has its own type-level test-id on
 * its own root (e.g. `activity-quiz` on AuQuiz). Tests can verify both
 * "an activity rendered" and "the *right* activity rendered."
 *
 * **L3 scope:** these assert the directive + subcomponent rendered.
 * They do NOT exercise the interactive parts (answering a quiz question,
 * running code, completing a scenario). Those would need the LRS layer
 * stubbed and are L2 / future-work territory.
 *
 * **Dev mode:** our synthetic launch params include `fetch=test`, which
 * `checkForDevMode()` reads to enable `isTestMode=true`. That keeps the
 * quiz from waiting on a real LRS hydration and lets it render the
 * question immediately.
 */

test.describe('quiz activity @activities', () => {
  test('Quiz slide renders the activity directive', async ({ page }) => {
    await page.getByTestId('player-slide-tab-6').click();

    const activity = page
      .getByTestId('player-slide-content')
      .getByTestId('directive-activity');
    await expect(activity).toBeVisible({ timeout: 10_000 });
  });

  test('Quiz slide tags the activity with type=quiz', async ({ page }) => {
    await page.getByTestId('player-slide-tab-6').click();

    const activity = page
      .getByTestId('player-slide-content')
      .getByTestId('directive-activity');
    await expect(activity).toHaveAttribute('data-activity-type', 'quiz');
  });

  test('Quiz slide renders the AuQuiz body', async ({ page }) => {
    await page.getByTestId('player-slide-tab-6').click();

    const quizBody = page
      .getByTestId('player-slide-content')
      .getByTestId('activity-quiz');
    await expect(quizBody).toBeVisible({ timeout: 10_000 });
  });

  test('Quiz slide shows the fixture quiz title', async ({ page }) => {
    await page.getByTestId('player-slide-tab-6').click();

    // The fixture's quiz JSON has `"title": "Quiz"`. The title renders as
    // an h2 in the AuQuiz body. We scope inside activity-quiz to avoid
    // matching the sidebar's "Quiz" slide tab label.
    const quizBody = page
      .getByTestId('player-slide-content')
      .getByTestId('activity-quiz');
    await expect(
      quizBody.getByRole('heading', { name: 'Quiz' }),
    ).toBeVisible();
  });

  test('Quiz slide shows the fixture question text', async ({ page }) => {
    await page.getByTestId('player-slide-tab-6').click();

    // The fixture's single quiz question is "What color is blue".
    const slideContent = page.getByTestId('player-slide-content');
    await expect(slideContent.getByText('What color is blue')).toBeVisible({
      timeout: 10_000,
    });
  });

  /**
   * Take-quiz interaction tests
   *
   * The fixture quiz: 1 freeResponse question, correct answer "blue",
   * grading "exact", passingScore 80. With 1 question, score is binary
   * — 100% (correct) or 0% (incorrect).
   *
   * **The UX flow:** after Submit, the score screen replaces the
   * question view. The score panel shows "Your Score: N%" plus Review
   * Answers / Try Again buttons. Inline question feedback ("Your Answer
   * is Correct" / "The Correct Answer is blue") only appears if the
   * learner drills back in via Review Answers — see the third test for
   * that path.
   *
   * **What we deliberately don't assert:** the "Passed" badge — it
   * requires `completionRequired === 'passed'` but the fixture has
   * `'completed-and-passed'`. The score-text assertion is more honest
   * to what users see and is robust against future fixture edits.
   */

  test('Quiz: submit correct answer → score is 100%', async ({ page }) => {
    await page.getByTestId('player-slide-tab-6').click();

    const slideContent = page.getByTestId('player-slide-content');
    await expect(slideContent.getByText('What color is blue')).toBeVisible({
      timeout: 10_000,
    });

    // The free-response input is a TextField with placeholder "Your Answer...".
    // Scoping to the slide content avoids any accidental sidebar matches.
    const answerInput = slideContent.getByPlaceholder('Your Answer...');
    await answerInput.fill('blue');

    // Submit button enables once the question is answered.
    const submitButton = slideContent.getByRole('button', { name: 'Submit' });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Score screen replaces the question view; assert the score and the
    // post-submit affordances.
    await expect(slideContent.getByText('Your Score: 100%')).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      slideContent.getByRole('button', { name: 'Review Answers' }),
    ).toBeVisible();
    await expect(
      slideContent.getByRole('button', { name: 'Try Again' }),
    ).toBeVisible();
  });

  test('Quiz: submit incorrect answer → score is 0%', async ({ page }) => {
    await page.getByTestId('player-slide-tab-6').click();

    const slideContent = page.getByTestId('player-slide-content');
    await expect(slideContent.getByText('What color is blue')).toBeVisible({
      timeout: 10_000,
    });

    const answerInput = slideContent.getByPlaceholder('Your Answer...');
    await answerInput.fill('red');

    const submitButton = slideContent.getByRole('button', { name: 'Submit' });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    await expect(slideContent.getByText('Your Score: 0%')).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      slideContent.getByRole('button', { name: 'Try Again' }),
    ).toBeVisible();
  });

  test('Quiz: Review Answers surfaces the correct-answer hint after a wrong submit', async ({
    page,
  }) => {
    // After submitting an incorrect answer, the score screen renders but
    // inline question feedback is hidden. Clicking "Review Answers" drills
    // back into the question view, where "The Correct Answer is blue"
    // becomes visible. Validates that the grade-feedback path is
    // reachable for learners, not just the score-only summary.
    await page.getByTestId('player-slide-tab-6').click();

    const slideContent = page.getByTestId('player-slide-content');
    const answerInput = slideContent.getByPlaceholder('Your Answer...');
    await answerInput.fill('red');
    await slideContent.getByRole('button', { name: 'Submit' }).click();

    await expect(slideContent.getByText('Your Score: 0%')).toBeVisible({
      timeout: 10_000,
    });

    await slideContent.getByRole('button', { name: 'Review Answers' }).click();

    await expect(
      slideContent.getByText('The Correct Answer is blue'),
    ).toBeVisible({ timeout: 10_000 });
  });
});

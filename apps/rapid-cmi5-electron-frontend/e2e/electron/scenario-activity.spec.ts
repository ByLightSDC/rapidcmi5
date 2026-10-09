import {
  test,
  expect,
  _electron as electron,
  Locator,
  Page,
  ElectronApplication,
} from '@playwright/test';
import { createRepo, selectFirstTreeNodeInDesigner } from '../e2e-utils.';

/**
 * Unified Scenario activity form (CCUI-3063)
 *
 * One SCENARIO entry in the Block Library. The form offers three deployment
 * types; each maps onto markdown that already exists:
 *   Individual Training -> :::scenario { "promptClass": false }
 *   Class Deployment    -> :::scenario { "promptClass": true }
 *   Team Exercise       -> :::consoles
 *
 * Only one scenario is allowed per lesson (Basic Auth and SSO can't be mixed),
 * so SCENARIO is disabled while the lesson has one of either kind.
 */

const REPO_NAME = 'e2e-scenario-repo';

// MiniForm autosave debounce is 500ms
const AUTOSAVE_SETTLE_MS = 1000;

let electronApp: ElectronApplication;

test.describe.configure({ mode: 'serial' });

async function getElectronWindow(): Promise<Page> {
  electronApp = await electron.launch({
    args: ['./dist/apps/rapid-cmi5-electron/main.js'],
    env: {
      ELECTRON_IS_TEST: 'true',
    },
  });

  await electronApp.evaluate(async ({ session }) => {
    await session.defaultSession.clearStorageData();
  });

  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  await expect(window.locator('body')).toBeVisible();
  return window;
}

async function closeElectronWindow(): Promise<void> {
  if (electronApp) {
    await electronApp.close();
  }
}

/** New repo, first slide open in the visual editor, cursor in the slide */
async function openSlideInEditor(window: Page): Promise<void> {
  await createRepo(window, REPO_NAME, 'main', 'test', 'test@gmai.com');
  await selectFirstTreeNodeInDesigner(window);

  // block insertion needs a collapsed cursor in the slide
  const content = window.locator('[contenteditable="true"]').first();
  await expect(content).toBeVisible();
  await content.click();
  await content.press('Control+End');
}

/** Open Block Library > Activities and return the SCENARIO insert button */
async function getInsertScenarioButton(window: Page): Promise<Locator> {
  const drawer = window.locator('#block-library');
  if (!(await drawer.isVisible())) {
    await window.getByRole('button', { name: 'Block Library' }).click();
  }
  await expect(drawer).toBeVisible();

  const scenarioButton = drawer.getByTestId('insert-activity-scenario');
  if (!(await scenarioButton.isVisible())) {
    await drawer.getByText('Activities', { exact: true }).click();
  }
  await expect(scenarioButton).toBeVisible();
  return scenarioButton;
}

/** The scenario activity form on the current slide */
function getScenarioForm(window: Page): Locator {
  return window
    .locator('.paper-activity')
    .filter({ has: window.getByTestId('scenario-type-individual') });
}

async function selectScenarioType(
  window: Page,
  type: 'individual' | 'class' | 'team',
): Promise<void> {
  await window.getByTestId(`scenario-type-${type}-select`).click();
  await expect(window.getByTestId(`scenario-type-${type}`)).toHaveAttribute(
    'data-selected',
    'true',
  );
  await window.waitForTimeout(AUTOSAVE_SETTLE_MS);
}

/** Switch to markdown source, read it, and switch back to the visual editor */
async function readSlideMarkdown(window: Page): Promise<string> {
  await window.getByRole('button', { name: 'Edit Markdown' }).click();
  const source = window.locator('.cm-content').first();
  await expect(source).toBeVisible();
  const markdown = await source.innerText();
  await window.getByRole('button', { name: 'Edit Rich Text' }).click();
  await expect(source).toBeHidden();
  return markdown;
}

test.describe('Scenario activity form', () => {
  test('Block Library offers a single Scenario entry', async () => {
    const window = await getElectronWindow();

    try {
      await openSlideInEditor(window);
      const scenarioButton = await getInsertScenarioButton(window);

      await expect(scenarioButton).toBeEnabled();
      // Team Exercise is now a deployment type inside the Scenario form
      await expect(
        window
          .locator('#block-library')
          .getByTestId('insert-activity-consoles'),
      ).toHaveCount(0);
    } finally {
      await closeElectronWindow();
    }
  });

  test('New scenario starts on the type chooser and saves each type', async () => {
    const window = await getElectronWindow();

    try {
      await openSlideInEditor(window);
      await (await getInsertScenarioButton(window)).click();

      // 1. Three panels, nothing selected, no settings section yet
      for (const type of ['individual', 'class', 'team']) {
        const card = window.getByTestId(`scenario-type-${type}`);
        await expect(card).toBeVisible();
        await expect(card).toHaveAttribute('data-selected', 'false');
      }
      await expect(
        window.getByRole('heading', { name: /Settings$/ }),
      ).toHaveCount(0);

      // 2. Team Exercise -> :::consoles
      await selectScenarioType(window, 'team');
      await expect(
        window.getByRole('heading', { name: 'Team Exercise Settings' }),
      ).toBeVisible();
      let markdown = await readSlideMarkdown(window);
      expect(markdown).toContain(':::consoles');
      expect(markdown).not.toContain(':::scenario');
      expect(markdown).not.toContain('promptClass');

      // round trip: the reloaded form re-derives Team from the markdown
      await expect(window.getByTestId('scenario-type-team')).toHaveAttribute(
        'data-selected',
        'true',
      );

      // 3. Class Deployment -> :::scenario with promptClass true + Class Id
      await selectScenarioType(window, 'class');
      await expect(
        window.getByRole('heading', { name: 'Class Deployment Settings' }),
      ).toBeVisible();
      await expect(
        getScenarioForm(window).getByLabel(/Class Id/),
      ).toBeVisible();
      markdown = await readSlideMarkdown(window);
      expect(markdown).toContain(':::scenario');
      expect(markdown).not.toContain(':::consoles');
      expect(markdown).toMatch(/"promptClass":\s*true/);
      await expect(window.getByTestId('scenario-type-class')).toHaveAttribute(
        'data-selected',
        'true',
      );

      // 4. Individual Training -> :::scenario with promptClass false
      await selectScenarioType(window, 'individual');
      await expect(
        window.getByRole('heading', { name: 'Individual Training Settings' }),
      ).toBeVisible();
      await expect(getScenarioForm(window).getByLabel(/Class Id/)).toHaveCount(
        0,
      );
      markdown = await readSlideMarkdown(window);
      expect(markdown).toContain(':::scenario');
      expect(markdown).toMatch(/"promptClass":\s*false/);
      expect(markdown).not.toContain('defaultClassId');
      await expect(
        window.getByTestId('scenario-type-individual'),
      ).toHaveAttribute('data-selected', 'true');
    } finally {
      await closeElectronWindow();
    }
  });

  test('Scenario entry is disabled while the lesson has a scenario', async () => {
    const window = await getElectronWindow();

    try {
      await openSlideInEditor(window);
      let scenarioButton = await getInsertScenarioButton(window);
      await expect(scenarioButton).toBeEnabled();

      await scenarioButton.click();
      await selectScenarioType(window, 'individual');

      // Individual / Class block a second scenario
      scenarioButton = await getInsertScenarioButton(window);
      await expect(scenarioButton).toBeDisabled();
      await scenarioButton.hover({ force: true });
      await expect(window.getByRole('tooltip')).toHaveText(
        'This lesson already has a scenario',
      );

      // switching to Team (SSO) keeps it blocked
      await selectScenarioType(window, 'team');
      await expect(await getInsertScenarioButton(window)).toBeDisabled();

      // deleting the activity frees the slot
      await getScenarioForm(window)
        .getByRole('button', { name: 'delete' })
        .click();
      await expect(window.getByTestId('scenario-type-team')).toHaveCount(0);
      await expect(await getInsertScenarioButton(window)).toBeEnabled();
    } finally {
      await closeElectronWindow();
    }
  });
});

import { z } from 'zod/v4';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const QUIZ_FORMAT = `# \`:::quiz\` directive — format reference

A quiz directive embeds an interactive assessment in a slide.

## Format

The directive body MUST be a fenced JSON code block. Bare YAML, plain
text, or markdown bullet lists will NOT render.

\`\`\`
:::quiz
\\\`\\\`\\\`json
{
  "cmi5QuizId": "unique-quiz-id",
  "title": "Optional quiz title",
  "passingScore": 80,
  "questions": [...]
}
\\\`\\\`\\\`
:::
\`\`\`

(In real markdown, replace \`\\\`\\\`\\\`\` with three real backticks. They are
escaped above only because this reference is itself a code block.)

## Required JSON fields

- \`cmi5QuizId\` (string) — UUID-style; unique within the workspace.
- \`passingScore\` (number 0–100) — minimum percent to pass.
- \`questions\` (array) — at least one question.

Each question requires:

- \`cmi5QuestionId\` (string) — unique within the quiz.
- \`question\` (string) — the prompt text.
- \`type\` — one of: \`freeResponse\`, \`number\`, \`multipleChoice\`,
  \`matching\`, \`trueFalse\`, \`selectAll\`.
- \`typeAttributes\` (object) — type-specific config.

## Question type examples

### multipleChoice

\`\`\`json
{
  "cmi5QuestionId": "q1",
  "question": "Which is the capital of France?",
  "type": "multipleChoice",
  "typeAttributes": {
    "grading": "exact",
    "correctAnswer": "Paris",
    "shuffleAnswers": true,
    "options": [
      { "text": "Paris",  "correct": true  },
      { "text": "London", "correct": false },
      { "text": "Madrid", "correct": false }
    ]
  }
}
\`\`\`

### trueFalse

\`\`\`json
{
  "cmi5QuestionId": "q2",
  "question": "Paris is the capital of France.",
  "type": "trueFalse",
  "typeAttributes": { "grading": "exact", "correctAnswer": "true" }
}
\`\`\`

### freeResponse

\`\`\`json
{
  "cmi5QuestionId": "q3",
  "question": "Name a French city.",
  "type": "freeResponse",
  "typeAttributes": { "grading": "exact", "correctAnswer": "Paris" }
}
\`\`\`

\`grading: "none"\` accepts any answer; \`grading: "exact"\` requires the
exact match.

## Picking the right question type

Match the question type to the cognitive level you're assessing:

- \`multipleChoice\` — recall, recognition, definitional knowledge. Best when
  there are clear plausible distractors. Bloom's: Remember, Understand.
- \`trueFalse\` — surfacing common misconceptions. Cheap to author but limited
  signal; mix with other types. Bloom's: Remember, Understand.
- \`selectAll\` — when more than one option may be correct (e.g. "which of
  these are valid causes…"). Tests that the learner doesn't stop at the first
  plausible answer. Bloom's: Understand, Analyze.
- \`matching\` — relationships, term-definition pairs, cause-effect links.
  Bloom's: Understand, Analyze.
- \`freeResponse\` — application, synthesis, defending a choice. Use
  \`grading: "none"\` if the answer is open-ended; \`grading: "exact"\` only
  for narrowly-defined answers (a specific term, a single number).
  Bloom's: Apply, Analyze, Evaluate, Create.
- \`number\` — quantitative answers where typos shouldn't fail. Bloom's:
  Apply, Analyze.

A well-designed quiz mixes types: 1-2 recall items to anchor terminology,
2-3 application/analysis items where the real learning lives.

## Editing an existing quiz on a slide

When the user asks to "add more questions" or "change a question" on a
slide that already has a \`:::quiz\` directive:

1. Call \`rc5_read_current_slide\` to get the slide markdown.
2. Locate the existing \`:::quiz\` directive in the content.
3. Parse the JSON inside.
4. Modify the \`questions\` array in place (append, replace at index, etc.).
5. Re-emit the directive with the merged JSON.
6. Call \`rc5_update_current_slide\` with the modified slide markdown.

DO NOT add a second \`:::quiz\` directive to the same slide — that creates
a duplicate quiz, not a merge.
`;

const CTF_FORMAT = `# \`:::ctf\` directive — format reference

A CTF (capture-the-flag) directive embeds free-response challenges in a slide.
It's quiz-shaped but every question is \`type: "freeResponse"\`.

## Format

The body MUST be a fenced JSON code block.

\`\`\`
:::ctf
\\\`\\\`\\\`json
{
  "cmi5QuizId": "unique-ctf-id",
  "passingScore": 100,
  "questions": [
    {
      "cmi5QuestionId": "q1",
      "question": "What is the flag?",
      "type": "freeResponse",
      "typeAttributes": {
        "grading": "exact",
        "correctAnswer": "FLAG{example}"
      }
    }
  ]
}
\\\`\\\`\\\`
:::
\`\`\`

## Required JSON fields

- \`cmi5QuizId\` (string) — unique within the workspace.
- \`passingScore\` (number 0–100) — minimum percent to pass.
- \`questions\` (array, ≥1).

Each question requires:

- \`cmi5QuestionId\` (string) — unique within this CTF.
- \`question\` (string) — prompt text.
- \`type\` — must be \`"freeResponse"\`. CTF supports no other types.
- \`typeAttributes.grading\` — \`"exact"\` or \`"none"\`.
- \`typeAttributes.correctAnswer\` (string or number) — required.

## Optional fields

- \`title\` (string), \`completionRequired\`, \`display.shouldNumberQuestions\`.
`;

const SCENARIO_FORMAT = `# \`:::scenario\` directive — format reference

A scenario directive embeds a RangeOS scenario reference.

## Format

\`\`\`
:::scenario
\\\`\\\`\\\`json
{
  "uuid": "rangeos-scenario-uuid"
}
\\\`\\\`\\\`
:::
\`\`\`

## Required JSON fields

- \`uuid\` (string) — the RangeOS scenario UUID.

## Optional fields

- \`name\` (string), \`promptClass\` (boolean), \`defaultClassId\` (string),
  \`cmi5QuizId\` (string).

The body MUST be a fenced JSON code block.
`;

const CODE_RUNNER_FORMAT = `# \`:::codeRunner\` directive — format reference

A codeRunner directive embeds a programming exercise that grades student code.

## Format

\`\`\`
:::codeRunner
\\\`\\\`\\\`json
{
  "cmi5QuizId": "unique-runner-id",
  "title": "Reverse a string",
  "description": "Write a function reverse(s) that returns the input reversed.",
  "programmingLanguage": "python",
  "languageVersion": "3.11",
  "evaluator": "import unittest\\nclass T(unittest.TestCase):\\n    def test(self): self.assertEqual(reverse('abc'), 'cba')",
  "student": "def reverse(s):\\n    pass"
}
\\\`\\\`\\\`
:::
\`\`\`

## Required JSON fields (all strings)

- \`cmi5QuizId\` — unique within the workspace.
- \`title\` — short challenge name.
- \`description\` — markdown describing the task.
- \`programmingLanguage\` — e.g. \`"python"\`, \`"javascript"\`.
- \`languageVersion\` — e.g. \`"3.11"\`, \`"20"\`.
- \`evaluator\` — full source of the test/grading harness. Newlines must be
  JSON-escaped (\`\\\\n\`).
- \`student\` — starter code shown to the learner. Newlines must be
  JSON-escaped.

The body MUST be a fenced JSON code block.
`;

const DOWNLOAD_FORMAT = `# \`:::download\` directive — format reference

A download directive offers one or more files for the learner to download.

## Format

\`\`\`
:::download
\\\`\\\`\\\`json
{
  "files": [
    { "name": "Worksheet.pdf", "path": "assets/worksheet.pdf", "type": "application/pdf" }
  ]
}
\\\`\\\`\\\`
:::
\`\`\`

## Required JSON fields

- \`files\` (array, ≥1). Each file requires:
  - \`name\` (string) — display name.
  - \`path\` (string) — relative to the course root.
  - \`type\` (string) — MIME type.

The body MUST be a fenced JSON code block.
`;

const CONSOLES_FORMAT = `# \`:::consoles\` directive — format reference

A team-consoles (a.k.a. team-exercise) directive references a multi-user
RangeOS scenario.

## Format

\`\`\`
:::consoles
\\\`\\\`\\\`json
{
  "uuid": "team-scenario-uuid",
  "name": "Network triage drill"
}
\\\`\\\`\\\`
:::
\`\`\`

## Required JSON fields

- \`uuid\` (string) — the team scenario UUID.
- \`name\` (string) — display name.

The body MUST be a fenced JSON code block.
`;

const ADMONITION_FORMAT = `# Admonition directives — format reference

Admonitions are call-out boxes for tips, warnings, examples, etc. They are
container directives whose body is plain markdown (NOT JSON-fenced — that
distinction matters: activity directives need JSON, admonitions don't).

## Format

The directive name IS the admonition type. There is no \`:::admonition\`
literal — instead use one of the 12 type names directly:

\`abstract\`, \`bug\`, \`danger\`, \`example\`, \`failure\`, \`info\`, \`note\`,
\`question\`, \`quote\`, \`success\`, \`tip\`, \`warning\`.

\`\`\`
:::tip{title="Pro Tip" collapse="closed"}
Always run rc5_get_directive_format before composing a new directive.
:::
\`\`\`

## Attributes

- \`title\` (string, optional) — display label. Defaults to capitalized type.
- \`collapse\` (\`"open"\` | \`"closed"\`, optional) — whether the box renders
  collapsed by default. Use \`"closed"\` for asides the learner can skip.

## When to use which type

- \`tip\` — best practices, shortcuts, expert advice.
- \`warning\` — caveats, common pitfalls, things to be careful of.
- \`danger\` — security or safety implications.
- \`note\` / \`info\` — general callouts that interrupt flow without changing it.
- \`example\` — worked examples or concrete illustrations.
- \`question\` — rhetorical or reflective prompts (NOT graded — use \`:::quiz\`).
- \`quote\` — direct quotations from sources.
- \`success\` / \`failure\` — outcome-oriented call-outs (e.g. "this passes" /
  "this is what failure looks like").
- \`abstract\` — summary/overview at the top of a slide.
- \`bug\` — known issues or anti-patterns the learner should recognize.

## Pedagogical use

Use admonitions to structure a slide's information hierarchy: main concept in
the body, then \`tip\` / \`warning\` / \`example\` boxes around it. They reduce
the cognitive load on the learner by pre-categorizing the content.
`;

const GRID_FORMAT = `# \`::::gridContainer\` directive — format reference

A grid container lays out child \`:::grid\` cells side-by-side. Each cell is
plain markdown. Use this for compare-and-contrast layouts, code-vs-output
displays, or any time two ideas should sit next to each other on the slide.

## Format

The container needs MORE colons than its cells (mdast directive nesting
rule). 4 colons wraps 3-colon cells:

\`\`\`
::::gridContainer{style="margin: 4px;"}
:::grid
**Before**

The original approach.
:::
:::grid
**After**

The improved approach.
:::
::::
\`\`\`

## Attributes

- \`gridContainer.style\` (string, optional) — CSS style applied to the
  container. The UI defaults to \`"margin: 4px;"\`. You can also set
  \`grid-template-columns\` for non-equal widths, e.g.
  \`style="grid-template-columns: 2fr 1fr;"\`.
- \`grid\` cells take no required attributes.

## Constraints

- Grids cannot be nested inside other grids.
- Each cell's body is markdown, including activity directives (you CAN put a
  \`:::quiz\` inside a \`:::grid\` cell, though it's rare).
- Two cells is most common (compare/contrast). Three or four work for taxonomies
  or progression diagrams; more than four overflows on smaller screens.

## When to use

- Compare two approaches, eras, codebases, definitions.
- Show input vs output, before vs after, raw vs interpreted.
- Lay out 2-4 short parallel ideas that don't warrant separate slides.

Don't use a grid as a generic two-column page layout — it's an editorial
device, not a typesetting tool. If the slide is just text, keep it linear.
`;

const ACCORDION_FORMAT = `# \`::::accordion\` directive — format reference

A vertical stack of collapsible sections. Each child is shown as a clickable
header; clicking expands its body.

## Format

The wrapper needs MORE colons than its cells. 4 colons wraps 3-colon cells:

\`\`\`
::::accordion{style="margin: 4px;"}
:::accordionContent{title="What is CMI5?"}
CMI5 is a learning specification for delivering xAPI-based content...
:::
:::accordionContent{title="When should I use it?"}
Use CMI5 when you need detailed analytics on learner behavior...
:::
::::
\`\`\`

## Attributes

- \`accordion.style\` (string, optional) — CSS for the wrapper.
- \`accordionContent.title\` (string, **required**) — header text shown collapsed.

## When to use

- FAQ sections.
- Optional deep-dives that not every learner needs.
- Glossaries and reference lookups.
- Long content that would otherwise overwhelm the slide.

Don't use for sequential procedures (use \`:::steps\`) or alternative views
of the same task (use \`:::tabs\`).
`;

const STEPS_FORMAT = `# \`::::steps\` directive — format reference

A numbered, sequential walk-through. Each child is rendered as a numbered
step with a title and body.

## Format

The wrapper needs MORE colons than its cells. 4 colons wraps 3-colon cells:

\`\`\`
::::steps{style="margin: 4px;"}
:::stepContent{title="Install the SDK"}
Run \\\`npm install @rapid-cmi5/sdk\\\` in your project root.
:::
:::stepContent{title="Configure your project"}
Add the configuration block to \\\`rc5.config.json\\\`...
:::
:::stepContent{title="Build and deploy"}
Run \\\`npm run build\\\` and upload the output to your LMS.
:::
::::
\`\`\`

## Attributes

- \`steps.style\` (string, optional) — CSS for the wrapper.
- \`stepContent.title\` (string, **required**) — step title.

## When to use

- Procedural lessons ("how to do X").
- Multi-stage processes where order matters.
- Tutorials, walkthroughs, lab exercises.

Don't use for non-sequential alternatives (use \`:::tabs\`) or for collapsible
asides (use \`:::accordion\`).
`;

const TABS_FORMAT = `# \`::::tabs\` directive — format reference

A horizontal tab bar where only one child is visible at a time. Each child
becomes a clickable tab with a title and body.

## Format

The wrapper needs MORE colons than its cells. 4 colons wraps 3-colon cells:

\`\`\`
::::tabs{style="margin: 4px;"}
:::tabContent{title="Linux"}
\\\`\\\`\\\`bash
sudo apt install rc5-cli
\\\`\\\`\\\`
:::
:::tabContent{title="macOS"}
\\\`\\\`\\\`bash
brew install rc5-cli
\\\`\\\`\\\`
:::
:::tabContent{title="Windows"}
Download the installer from rc5.example.com/download.
:::
::::
\`\`\`

## Attributes

- \`tabs.style\` (string, optional) — CSS for the wrapper.
- \`tabContent.title\` (string, **required**) — tab label.

## When to use

- Showing the SAME task across different environments (Linux/macOS/Windows,
  Python/JS/Go, dev/staging/prod).
- Alternative scenarios where the learner picks one based on context.

Don't use for sequential procedures (use \`:::steps\`) or for content that
benefits from being visible all at once (use a \`::::gridContainer\` or
\`::::accordion\`).
`;

const STATEMENTS_FORMAT = `# \`::::statements\` directive — format reference

A visual list of standalone statements. Each statement is rendered with
emphasized typography. Used for principles, rules, callouts that deserve
visual weight.

## Format

The wrapper needs MORE colons than its cells. 4 colons wraps 3-colon cells:

\`\`\`
::::statements{preset="1"}
:::statement
The signal is in the noise — but only if you stop chasing every alert.
:::
:::statement
Patterns emerge when you zoom out. Patience is a forensic skill.
:::
::::
\`\`\`

## Attributes

- \`statements.preset\` (string, **required**) — layout preset:
  - \`"1"\` — Compact & Centered
  - \`"2"\` — Centered
  - \`"3"\` — Left Aligned
  - \`"4"\` — Left Aligned & Emphasis
- \`statement\` cells take no required attributes; body is the statement text.

## When to use

- Highlighting principles or rules a learner should internalize.
- Punching up a slide with high-impact phrasings.
- Quote-like content where you don't have a specific author (use
  \`::::quotes\` if you do).

Don't pack too many — 2-4 statements per block. After that they lose impact.
`;

const QUOTES_FORMAT = `# \`::::quotes\` directive — format reference

Attributed quotations with author and (optional) avatar. Multiple quotes can
be grouped under one wrapper.

## Format

\`\`\`
::::quotes{preset="1" style="margin: 4px;"}
:::quoteContent{author="Alex Mercer, Senior Threat Intelligence Analyst" avatar="/assets/images/alex.png"}
"The question isn't whether you've been breached — it's whether you know about it yet."
:::
::::
\`\`\`

## Attributes

- \`quotes.preset\` (string, **required**) — layout:
  - \`"1"\` — Vertical (large quote, stacked)
  - \`"2"\` — Compact Vertical (small quote, stacked)
  - \`"3"\` — Horizontal (avatar beside quote)
  - \`"4"\` — Compact Horizontal
- \`quotes.style\` (string, optional) — CSS for the wrapper.
- \`quoteContent.author\` (string, optional) — recommended; format as
  \`"Name, Role"\`.
- \`quoteContent.avatar\` (string, optional) — image path. Falls back to a
  placeholder if omitted.

The quote text itself is the body of the \`:::quoteContent\` cell.

## When to use

- Testimonials from real practitioners.
- Direct quotations from primary sources.
- Reinforcing a concept with an authoritative voice.

Don't use for content YOU are saying (use \`:::admonition\` of type \`quote\`,
or just inline blockquote with \`>\`).
`;

const LAYOUT_FORMAT = `# \`:::layout\` directive — format reference

A flexbox container that wraps arbitrary content. Use for fine-grained
alignment when neither \`::::gridContainer\` (multi-column) nor an
admonition fits.

## Format

\`\`\`
:::layout{justifyContent="center" alignItems="center"}
# Centered Header

Some centered content here.
:::
\`\`\`

## Attributes

- \`justifyContent\` (string, optional) — main-axis alignment. Standard CSS
  flex values: \`flex-start\`, \`center\`, \`flex-end\`, \`space-between\`,
  \`space-around\`, \`space-evenly\`. Default: \`flex-start\`.
- \`alignItems\` (string, optional) — cross-axis alignment. Standard CSS
  flex values: \`flex-start\`, \`center\`, \`flex-end\`, \`stretch\`,
  \`baseline\`. Default: \`flex-start\`.

The body is markdown — anything you'd put on a slide can go inside.

## When to use

- Centering a block of content on the slide.
- Aligning a hero element (image + caption) precisely.
- Stylistic polish on otherwise-text slides.

Don't use as a generic container — most content doesn't need a layout
wrapper. If you reach for \`:::layout\` more than once per slide, consider
whether the slide is doing too much.
`;

const FORMATS: Record<string, string | undefined> = {
  quiz: QUIZ_FORMAT,
  ctf: CTF_FORMAT,
  scenario: SCENARIO_FORMAT,
  codeRunner: CODE_RUNNER_FORMAT,
  download: DOWNLOAD_FORMAT,
  consoles: CONSOLES_FORMAT,
  admonition: ADMONITION_FORMAT,
  grid: GRID_FORMAT,
  accordion: ACCORDION_FORMAT,
  steps: STEPS_FORMAT,
  tabs: TABS_FORMAT,
  statements: STATEMENTS_FORMAT,
  quotes: QUOTES_FORMAT,
  layout: LAYOUT_FORMAT,
};

export function registerGetDirectiveFormat(server: McpServer): void {
  server.registerTool(
    'rc5_get_directive_format',
    {
      title: 'Get directive format reference',
      description:
        'Returns the canonical schema and a worked example for a CMI5 slide directive (e.g. `:::quiz`, `:::admonition`). Call this BEFORE composing markdown that includes a directive — getting the body shape wrong (bare YAML, missing fields, wrong fence) means the directive will not render. Returns markdown documentation specific to the directive type.',
      inputSchema: {
        name: z
          .enum([
            'quiz',
            'admonition',
            'grid',
            'ctf',
            'scenario',
            'codeRunner',
            'download',
            'consoles',
            'accordion',
            'steps',
            'tabs',
            'statements',
            'quotes',
            'layout',
          ])
          .describe('The directive name (without the leading `:::`).'),
      },
      outputSchema: {
        name: z.string(),
        markdown: z.string().describe('Markdown reference for the directive.'),
      },
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
      },
    },
    async ({ name }) => {
      const format = FORMATS[name];
      if (!format) {
        const documented = Object.keys(FORMATS).filter((k) => FORMATS[k]);
        return {
          content: [
            {
              type: 'text',
              text: `No format reference is documented yet for \`:::${name}\`. Currently documented: ${
                documented.length ? documented.join(', ') : '(none)'
              }. The format invariant for ALL activity directives (quiz, ctf, scenario, codeRunner, download, consoles) is: directive body must be a fenced JSON code block matching the directive's content schema.`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text', text: format }],
        structuredContent: { name, markdown: format },
      };
    },
  );
}

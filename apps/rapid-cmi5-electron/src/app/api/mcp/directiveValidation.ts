import { fromMarkdown } from 'mdast-util-from-markdown';
import { directive } from 'micromark-extension-directive';
import { directiveFromMarkdown } from 'mdast-util-directive';
import { visit } from 'unist-util-visit';
import { CourseData, QuizContentSchema } from '@rapid-cmi5/cmi5-build-common';

import { CTFContentSchema } from './schemas/ctf';
import { CodeRunnerContentSchema } from './schemas/codeRunner';
import { DownloadFilesContentSchema } from './schemas/download';
import { ScenarioContentSchema } from './schemas/scenario';
import { TeamConsolesContentSchema } from './schemas/consoles';

const DIRECTIVE_SCHEMAS = {
  quiz: QuizContentSchema,
  ctf: CTFContentSchema,
  codeRunner: CodeRunnerContentSchema,
  download: DownloadFilesContentSchema,
  scenario: ScenarioContentSchema,
  consoles: TeamConsolesContentSchema,
} as const;

type DirectiveName = keyof typeof DIRECTIVE_SCHEMAS;

const DIRECTIVE_NAMES = Object.keys(DIRECTIVE_SCHEMAS) as DirectiveName[];

export interface DirectiveError {
  directiveName: string;
  line: number;
  message: string;
}

export interface DirectiveValidationResult {
  ok: boolean;
  errors: DirectiveError[];
}

const REMINDER =
  "Reminder: directive bodies for quiz / ctf / scenario / codeRunner / download / consoles must be a fenced JSON code block matching the directive's content schema. Call rc5_get_directive_format(name) for the exact shape.";

export function validateDirectivesInMarkdown(
  content: string,
): DirectiveValidationResult {
  const errors: DirectiveError[] = [];
  if (typeof content !== 'string' || content.length === 0) {
    return { ok: true, errors };
  }

  const tree = fromMarkdown(content, {
    extensions: [directive()],
    mdastExtensions: [directiveFromMarkdown()],
  });

  visit(tree, (node) => {
    if (node.type !== 'containerDirective') return;
    if (!(node.name in DIRECTIVE_SCHEMAS)) return;

    const line = node.position?.start?.line ?? 1;
    const schema = DIRECTIVE_SCHEMAS[node.name as DirectiveName];

    const child = node.children?.[0];
    let raw: string | undefined;
    if (child?.type === 'code') {
      raw = child.value;
    } else if (
      child?.type === 'paragraph' &&
      child.children?.[0]?.type === 'text'
    ) {
      raw = child.children[0].value;
    }

    if (!raw) {
      errors.push({
        directiveName: node.name,
        line,
        message: `:::${node.name} body must be a fenced JSON code block matching the directive's schema.`,
      });
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      errors.push({
        directiveName: node.name,
        line,
        message: `:::${node.name} contains invalid JSON. Body must be a fenced JSON code block.`,
      });
      return;
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        errors.push({
          directiveName: node.name,
          line,
          message: `:::${node.name}${path ? ` ${path}` : ''}: ${issue.message}`,
        });
      }
    }
  });

  return { ok: errors.length === 0, errors };
}

export function validateCourseDirectives(
  course: CourseData,
): DirectiveValidationResult {
  const groups: string[] = [];
  for (const block of course.blocks ?? []) {
    for (const au of block.aus ?? []) {
      for (const slide of au.slides ?? []) {
        if (typeof slide.content !== 'string' || slide.content.length === 0) {
          continue;
        }
        const { errors } = validateDirectivesInMarkdown(slide.content);
        if (errors.length > 0) {
          const detail = errors
            .map((e) => `    - line ${e.line}: ${e.message}`)
            .join('\n');
          groups.push(
            `Slide "${slide.slideTitle}" in lesson "${au.auName}":\n${detail}`,
          );
        }
      }
    }
  }
  return {
    ok: groups.length === 0,
    errors: groups.map((message) => ({
      directiveName: '',
      line: 0,
      message,
    })),
  };
}

export function formatValidationError(
  prefix: string,
  errors: DirectiveError[],
): string {
  const body = errors.map((e) => e.message).join('\n\n');
  return `${prefix}\n\n${body}\n\n${REMINDER}`;
}

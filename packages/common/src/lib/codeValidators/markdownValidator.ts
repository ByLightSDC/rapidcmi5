import {
  ContainerDirective,
  directiveFromMarkdown,
} from 'mdast-util-directive';
import type { Position } from 'unist';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { directive } from 'micromark-extension-directive';
import { visit } from 'unist-util-visit';
import {
  DirectiveContentMap,
  isSupportedDirectiveName,
  supportedDirectiveNames,
  validateDirectiveContent,
} from './directiveValidators';
import { DirectiveName, ScenarioContent } from '../types/activities';

// We create our own version from monaco editor, no reason to be tied up with theres
export enum MarkerSeverity {
  Hint = 1,
  Info = 2,
  Warning = 4,
  Error = 8,
}
export interface IMarkerData {
  code?:
    | string
    | {
        value: string;
        target: any;
      };
  severity: MarkerSeverity;
  message: string;
  source?: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  modelVersionId?: number;
  relatedInformation?: any[];
  tags?: any[];
}

// An intermediary data structure should be considered instead of the monaco type
// For now it holds all the data we need and is a good fit for transforming into code mirror format (mdxEditor)
export function validateMarkdownDirectives(content: string): IMarkerData[] {
  const errorMarkers: IMarkerData[] = [];

  visit(parseMarkdown(content), (node) => {
    if (node.type === 'containerDirective') {
      if (isSupportedDirectiveName(node.name)) {
        errorMarkers.push(...validateDirective(node));
      }
    }
  });

  return errorMarkers;
}

function parseMarkdown(content: string) {
  return fromMarkdown(content, {
    extensions: [directive()],
    mdastExtensions: [directiveFromMarkdown()],
  });
}

/**
 * A directive body is a fenced code block (or, for legacy content, a bare
 * paragraph) holding JSON. `ok: false` means there was nothing parseable.
 */
function getDirectiveJson(
  node: ContainerDirective,
): { ok: true; value: unknown } | { ok: false } {
  const firstChild = node.children[0];
  let content: string | undefined;

  if (firstChild?.type === 'code') {
    content = firstChild.value;
  } else if (firstChild?.type === 'paragraph') {
    const textChild = firstChild.children[0];
    if (textChild?.type === 'text') content = textChild.value;
  }

  if (!content) return { ok: false };

  try {
    return { ok: true, value: JSON.parse(content) };
  } catch {
    return { ok: false };
  }
}

/** Return all schema-valid directives of one type from a markdown document. */
export function getValidDirectives<Name extends DirectiveName>(
  content: string,
  directiveName: Name,
): DirectiveContentMap[Name][] {
  const directives: DirectiveContentMap[Name][] = [];

  visit(parseMarkdown(content), (node) => {
    if (node.type !== 'containerDirective' || node.name !== directiveName) {
      return;
    }

    const json = getDirectiveJson(node);
    if (!json.ok) return;

    const result = validateDirectiveContent(directiveName, json.value);
    if (result.valid) directives.push(result.data);
  });

  return directives;
}

export type ValidDirectiveMap = {
  [Name in DirectiveName]: DirectiveContentMap[Name][];
};

/** Parse a markdown document once and group all schema-valid directives. */
export function getValidDirectiveMap(content: string): ValidDirectiveMap {
  // fromEntries cannot see that the keys cover every DirectiveName
  const directives = Object.fromEntries(
    supportedDirectiveNames.map((name) => [name, []]),
  ) as unknown as ValidDirectiveMap;

  visit(parseMarkdown(content), (node) => {
    if (
      node.type !== 'containerDirective' ||
      !isSupportedDirectiveName(node.name)
    ) {
      return;
    }

    const json = getDirectiveJson(node);
    if (!json.ok) return;

    const result = validateDirectiveContent(node.name, json.value);
    if (result.valid) {
      (directives[node.name] as unknown[]).push(result.data);
    }
  });

  return directives;
}

/**
 * Get list of directives in the slide content
 * @param content
 * @param directiveFilter Filter for a specific type of directive
 * @returns directive content
 */
export function getScenarioDirectives(
  content: string,
  directiveFilter?: string,
): ScenarioContent[] {
  const filter = directiveFilter || 'scenario';
  if (filter !== 'scenario' && filter !== 'consoles') return [];
  return getValidDirectives(content, filter);
}

export function validateDirective(node: ContainerDirective): IMarkerData[] {
  if (!isSupportedDirectiveName(node.name)) {
    return [invalidJsonResponse(node.position)];
  }

  const json = getDirectiveJson(node);
  if (!json.ok) return [invalidJsonResponse(node.position)];

  const result = validateDirectiveContent(node.name, json.value);
  return result.valid
    ? []
    : result.errors.map((message) => toMarker(message, node.position));
}

function toMarker(message: string, pos: Position | undefined): IMarkerData {
  return {
    startLineNumber: pos?.start.line ?? 1,
    startColumn: pos?.start.column ?? 1,
    endLineNumber: pos?.end.line ?? 1,
    endColumn: pos?.end.column ?? 1,
    message,
    severity: MarkerSeverity.Error,
  };
}

function invalidJsonResponse(pos: Position | undefined): IMarkerData {
  return toMarker('Invalid JSON', pos);
}

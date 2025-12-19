import {
  ContainerDirective,
  directiveFromMarkdown,
} from 'mdast-util-directive';
import type { Position } from 'unist';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { directive } from 'micromark-extension-directive';
import { visit } from 'unist-util-visit';
import {
  validateCTFContent,
  validateDownloadFilesContent,
  validateJobeContent,
  validateQuizContent,
  validateScenarioContent,
  validateTeamConsolesContent,
} from './directiveValidators';

import {
  RC5ScenarioContent,
  TeamConsolesContent,
} from '@rapid-cmi5/cmi5-build/common';

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

// We could get data that is completly malformed, therefore we use type unknown
type ValidatorFn = (
  data: unknown,
) => { valid: true; data: any } | { valid: false; errors: string[] };

const directiveValidators: Record<string, ValidatorFn> = {
  consoles: validateTeamConsolesContent,
  quiz: validateQuizContent,
  scenario: validateScenarioContent,
  ctf: validateCTFContent,
  download: validateDownloadFilesContent,
  jobe: validateJobeContent,
};

const directiveKeys = Object.keys(directiveValidators);

// An intermediary data structure should be considered instead of the monaco type
// For now it holds all the data we need and is a good fit for transforming into code mirror format (mdxEditor)
export function validateMarkdownDirectives(content: string): IMarkerData[] {
  const errorMarkers: IMarkerData[] = [];

  const tree = fromMarkdown(content, {
    extensions: [directive()],
    mdastExtensions: [directiveFromMarkdown()],
  });
  visit(tree, (node) => {
    if (node.type === 'containerDirective') {
      if (directiveKeys.includes(node.name)) {
        errorMarkers.push(...validateDirective(node));
      }
    }
  });

  return errorMarkers;
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
): RC5ScenarioContent[] | TeamConsolesContent[] {
  const tree = fromMarkdown(content, {
    extensions: [directive()],
    mdastExtensions: [directiveFromMarkdown()],
  });

  const filter = directiveFilter || 'scenario';

  const directives: any[] = [];

  visit(tree, (node) => {
    if (node.type !== 'containerDirective' || node.name !== filter) return;

    const pchild = node.children[0];
    // We need to allow for legacy validation as well
    let content;

    if (pchild?.type === 'code') {
      content = pchild.value;
    } else if (pchild?.type === 'paragraph') {
      const tchild = pchild.children[0];
      if (tchild?.type === 'text') {
        content = tchild.value;
      }
    } else {
      return;
    }

    if (!content) return;
    let directiveContent;

    try {
      directiveContent = JSON.parse(content);
    } catch (e) {
      console.log('Error parsing json in directive', e);
      return;
    }
    const validator = directiveValidators[node.name];

    if (!validator) {
      console.log('No Validator Found', node.name);
      return;
    }

    let result = validator(directiveContent);
    if (!result.valid) return;
    directives.push(result.data);
  });

  return directives;
}

export function validateDirective(node: ContainerDirective): IMarkerData[] {
  const pchild = node.children[0];

  // We need to allow for legacy validation as well
  let content;
  if (pchild?.type === 'code') {
    content = pchild.value;
  } else if (pchild?.type === 'paragraph') {
    const tchild = pchild.children[0];
    if (tchild?.type === 'text') {
      content = tchild.value;
    }
  } else {
    return [invalidJsonResponse(node.position)];
  }
  if (!content) return [invalidJsonResponse(node.position)];
  try {
    const directiveContent = JSON.parse(content);

    const validator = directiveValidators[node.name];
    if (!validator) return [invalidJsonResponse(node.position)];

    let result = validator(directiveContent);

    if (result.valid) return [];

    return result.errors.map((msg) => toMarker(msg, node.position));
  } catch (e) {
    return [invalidJsonResponse(node.position)];
  }
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

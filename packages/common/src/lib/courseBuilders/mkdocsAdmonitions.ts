import { AdmonitionTypeEnum } from '../types';
import { parseToMdast } from './markdownNormalization';

export function convertMkdocsAdmonitions(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let i = 0;

  const headerRE =
    /^\s*(\?\?\?|!!!)(\+)?\s+([A-Za-z][\w-]*)(?:\s+"([^"]*)")?\s*$/;

  function escAttr(raw: string) {
    if (!raw) return '';
    let s = String(raw);

    // Remove Markdown-style backslash escapes, but keep the escaped char
    s = s.replace(/\\([\\`*_{}\[\]()>#+\-.!|:~/])/g, '$1');

    // Drop any remaining backslashes (if you want to be strict)
    s = s.replace(/\\/g, '');

    // Remove asterisks entirely
    s = s.replace(/\*/g, '');

    // Escape double quotes for attribute context
    s = s.replace(/"/g, '&quot;');

    // Collapse newlines/extra whitespace
    s = s
      .replace(/\r?\n|\r/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return s;
  }

  type AdmonitionType =
    (typeof AdmonitionTypeEnum)[keyof typeof AdmonitionTypeEnum];

  function isAdmonitionType(s: string): s is AdmonitionType {
    return (Object.values(AdmonitionTypeEnum) as string[]).includes(s);
  }

  while (i < lines.length) {
    const m = lines[i].match(headerRE);
    if (!m) {
      out.push(lines[i++]);
      continue;
    }

    const marker = m[1]; // ??? or !!!
    const plus = !!m[2]; // ???+ means open by default
    let kind = m[3].toLowerCase(); // abstract, note, tip, etc.
    if (!isAdmonitionType(kind)) kind = AdmonitionTypeEnum.note;
    const title = m[4]; // optional "Title"

    const content: string[] = [];
    let j = i + 1;

    const fenceStartRE = /^[ \t]*`{3,}/;

    const fenceEndRE = /^[ \t]*`{3,}\s*$/;

    let openingBacktickCount = 3;

    while (j < lines.length) {
      const ln = lines[j];

      // start of fenced code?
      if (fenceStartRE.test(ln)) {
        openingBacktickCount = ln.length;
        j++;
        while (j < lines.length) {
          if (fenceEndRE.test(lines[j])) {
            if (lines[j].length === openingBacktickCount) break;
          }
          content.push(lines[j]);
          j++;
        }
        if (j < lines.length) j++;
        break;
      }
      if (ln === '') {
        const next = lines[j + 1];
        if (next && fenceStartRE.test(next)) {
          content.push('');
          j++;
          continue;
        }
        break; // end of admonition content
      }
      content.push(ln);
      j++;
    }

    // Build directive attributes
    const attrs: string[] = [];
    attrs.push(`title="${escAttr(title) || kind}"`);

    if (marker === '???') {
      attrs.push(`collapse="${plus ? 'open' : 'closed'}"`);
    }

    const attrStr = attrs.length ? `{${attrs.join(' ')}}` : '';

    out.push(`:::${kind}${attrStr}`);

    md = parseToMdast(content.join('\n'));

    out.push(md);
    out.push(':::');

    i = j;
  }

  return out.join('\n');
}

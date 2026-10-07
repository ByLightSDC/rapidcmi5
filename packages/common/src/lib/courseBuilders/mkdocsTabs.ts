type Tab = { title: string; content: string };

const tabHeader = /^===([+!]?)[ \t]+"([^"]+)"[ \t]*$/;

function renderTabs(tabs: Tab[]): string {
  return [
    '::::tabs',
    ...tabs.flatMap(({ title, content }) => [
      `:::tabContent{title=${JSON.stringify(title)}}`,
      content,
      ':::',
      '',
    ]),
    '::::',
  ].join('\n');
}

export function extractMkdocsTabs(content: string) {
  const lines = content.split(/\r?\n/);
  const output: string[] = [];
  const replacements: Array<{ placeholder: string; directive: string }> = [];
  let index = 0;
  let fence: { marker: string; length: number } | undefined;

  while (index < lines.length) {
    const codeFence = /^ {0,3}(`{3,}|~{3,})/.exec(lines[index]);
    if (fence) {
      if (
        codeFence?.[1][0] === fence.marker &&
        codeFence[1].length >= fence.length
      ) {
        fence = undefined;
      }
      output.push(lines[index++]);
      continue;
    }
    if (codeFence) {
      fence = { marker: codeFence[1][0], length: codeFence[1].length };
      output.push(lines[index++]);
      continue;
    }
    const first = tabHeader.exec(lines[index]);
    if (!first) {
      output.push(lines[index++]);
      continue;
    }

    const tabs: Tab[] = [];
    while (index < lines.length) {
      const header = tabHeader.exec(lines[index]);
      if (!header || (tabs.length > 0 && header[1] === '!')) break;
      index++;

      const body: string[] = [];
      while (index < lines.length) {
        const line = lines[index];
        if (/^(?: {4}|\t)/.test(line)) {
          body.push(line.replace(/^(?: {4}|\t)/, ''));
          index++;
          continue;
        }
        if (line.trim() === '') {
          let next = index + 1;
          while (next < lines.length && lines[next].trim() === '') next++;
          if (
            next < lines.length &&
            (/^(?: {4}|\t)/.test(lines[next]) || tabHeader.test(lines[next]))
          ) {
            body.push('');
            index++;
            continue;
          }
        }
        break;
      }
      while (body.at(-1) === '') body.pop();
      if (!body.length) {
        throw new Error(`MkDocs tab "${header[2]}" has no content`);
      }
      tabs.push({ title: header[2], content: body.join('\n') });

      while (index < lines.length && lines[index].trim() === '') index++;
      const next = index < lines.length ? tabHeader.exec(lines[index]) : null;
      if (!next || next[1] === '!') break;
    }

    const placeholder = `RC5TABPLACEHOLDER${replacements.length}RC5`;
    if (content.includes(placeholder)) {
      throw new Error('MkDocs tab placeholder collision');
    }
    replacements.push({ placeholder, directive: renderTabs(tabs) });
    output.push('', placeholder, '');
  }

  return { markdown: output.join('\n'), replacements };
}

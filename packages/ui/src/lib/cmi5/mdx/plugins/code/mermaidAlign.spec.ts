import { getMermaidAlign, withMermaidAlign } from './MermaidDiagram';

describe('getMermaidAlign', () => {
  it.each([
    [undefined, 'center'],
    [null, 'center'],
    ['', 'center'],
    ['align=left', 'left'],
    ['align=right', 'right'],
    ['align=center', 'center'],
    ['title="x" align=right', 'right'],
    ['align=right title="x"', 'right'],
    // unknown values and look-alike tokens fall back to the default
    ['align=middle', 'center'],
    ['valign=right', 'center'],
  ])('meta %p -> %p', (meta, expected) => {
    expect(getMermaidAlign(meta)).toBe(expected);
  });
});

describe('withMermaidAlign', () => {
  it('adds an align token to empty meta', () => {
    expect(withMermaidAlign('', 'right')).toBe('align=right');
    expect(withMermaidAlign(undefined, 'left')).toBe('align=left');
  });

  it('writes the default (center) as no token', () => {
    expect(withMermaidAlign('align=right', 'center')).toBe('');
    expect(withMermaidAlign(null, 'center')).toBe('');
  });

  it('replaces an existing align token', () => {
    expect(withMermaidAlign('align=left', 'right')).toBe('align=right');
  });

  it('keeps other meta tokens', () => {
    expect(withMermaidAlign('title="x" align=left', 'right')).toBe(
      'title="x" align=right',
    );
    expect(withMermaidAlign('align=left title="x"', 'center')).toBe(
      'title="x"',
    );
  });

  it('round-trips through getMermaidAlign', () => {
    for (const align of ['left', 'center', 'right'] as const) {
      expect(getMermaidAlign(withMermaidAlign('title="x"', align))).toBe(align);
    }
  });
});

import { afterEach, describe, expect, it } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';
import { buildCmi5 } from './buildCmi5';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

describe('MkDocs course conversion', () => {
  it('places slides under their immediate parent AU and groups AUs into blocks', async () => {
    const root = await fs.mkdtemp(path.join(tmpdir(), 'cmi5-nav-test-'));
    temporaryDirectories.push(root);
    const coursePath = path.join(root, 'course');
    const playerPath = path.join(root, 'player');
    await fs.mkdir(path.join(coursePath, 'docs', 'assets'), {
      recursive: true,
    });
    await fs.mkdir(playerPath);
    await fs.writeFile(
      path.join(coursePath, 'mkdocs.yml'),
      [
        'site_name: Sample Course',
        'nav:',
        '  - Program:',
        '      - Introduction: intro.md',
        '      - External: https://example.test',
        '      - Classroom:',
        '          - Module 1:',
        '              - Overview: first.md',
        '              - Practice: second.md',
        '          - Module 2:',
        '              - Overview: third.md',
        '      - Workshop:',
        '          - Module 1:',
        '              - Review: fourth.md',
      ].join('\n'),
    );
    await fs.writeFile(
      path.join(coursePath, 'docs', 'intro.md'),
      '# Introduction\n\n[Start Module 1](./first.md)',
    );
    await fs.writeFile(
      path.join(coursePath, 'docs', 'first.md'),
      '# First\n\n![Diagram](./assets/diagram.png)\n\n![Space](./assets/diagram with spaces.png)',
    );
    await fs.writeFile(path.join(coursePath, 'docs', 'second.md'), '# Second');
    await fs.writeFile(path.join(coursePath, 'docs', 'third.md'), '# Third');
    await fs.writeFile(path.join(coursePath, 'docs', 'fourth.md'), '# Fourth');
    await fs.writeFile(
      path.join(coursePath, 'docs', 'assets', 'diagram.png'),
      'image',
    );
    await fs.writeFile(
      path.join(coursePath, 'docs', 'assets', 'diagram with spaces.png'),
      'image with spaces',
    );
    await fs.writeFile(path.join(playerPath, 'index.html'), '<base href="/">');
    await fs.writeFile(path.join(playerPath, 'cfg.json'), '{}');
    await fs.writeFile(path.join(playerPath, 'favicon.ico'), 'icon');

    const course = await buildCmi5(
      coursePath,
      playerPath,
      {
        courseBaseId: 'https://example.test/courses/sample',
        courseDescription: 'Sample course description',
      },
      true,
    );

    expect(course?.blocks.map((block) => block.blockName)).toEqual([
      'Sample Course',
      'Program / Classroom',
      'Program / Workshop',
    ]);
    expect(course?.blocks[0].aus.map((au) => au.auName)).toEqual(['Program']);
    expect(course?.blocks[1].aus.map((au) => au.auName)).toEqual([
      'Module 1',
      'Module 2',
    ]);
    expect(course?.blocks[2].aus[0].auName).toBe('Module 1');
    expect(course?.blocks[2].aus[0].dirPath).toBe('module-1-2');
    expect(
      course?.blocks[1].aus[0].slides.map((slide) => slide.slideTitle),
    ).toEqual(['Overview', 'Practice']);

    const blocksPath = path.join(playerPath, 'compiled_course', 'blocks');
    const rc5 = JSON.parse(
      await fs.readFile(path.join(blocksPath, 'RC5.yaml'), 'utf8'),
    );
    expect(rc5.courseId).toBe('https://example.test/courses/sample');
    expect(rc5.courseDescription).toBe('Sample course description');
    expect(
      rc5.blocks.map((block: { blockName: string }) => block.blockName),
    ).toEqual(['Sample Course', 'Program / Classroom', 'Program / Workshop']);
    const moduleOne = course!.blocks[1].aus[0];
    expect(moduleOne.dirPath).toBe('module-1');
    expect(moduleOne.slides[0].filepath).toBe('module-1/first.md');
    expect(moduleOne.slides[0].content).toContain('../_assets/diagram.png');
    expect(moduleOne.slides[0].content).toContain(
      '../_assets/diagram with spaces.png',
    );
    expect(course?.blocks[0].aus[0].slides[0].content).toContain(
      '../module-1/first.md',
    );
    expect(
      await fs.readFile(
        path.join(blocksPath, moduleOne.slides[0].filepath),
        'utf8',
      ),
    ).toContain('../_assets/diagram.png');
    expect(
      await fs.readFile(
        path.join(blocksPath, moduleOne.dirPath, 'config.json'),
        'utf8',
      ),
    ).toContain('"auName": "Module 1"');
    expect(
      await fs.readFile(
        path.join(blocksPath, '_assets', 'diagram.png'),
        'utf8',
      ),
    ).toBe('image');
    for (const block of course!.blocks) {
      for (const au of block.aus) {
        const config = JSON.parse(
          await fs.readFile(
            path.join(blocksPath, au.dirPath, 'config.json'),
            'utf8',
          ),
        );
        expect(config.auName).toBe(au.auName);
        expect(au.dirPath).not.toContain('/');
        expect(
          new URL(
            '../RC5.yaml',
            `https://example.test/compiled_course/blocks/${au.dirPath}/index.html`,
          ).pathname,
        ).toBe('/compiled_course/blocks/RC5.yaml');
        await expect(
          fs.stat(path.join(blocksPath, au.dirPath, 'index.html')),
        ).resolves.toBeDefined();
      }
    }
    await expect(fs.stat(path.join(blocksPath, 'docs'))).rejects.toMatchObject({
      code: 'ENOENT',
    });
    const cmi5Xml = await fs.readFile(
      path.join(playerPath, 'cmi5.xml'),
      'utf8',
    );
    expect(cmi5Xml).toContain('compiled_course/blocks/module-1/index.html');
    expect(cmi5Xml).toContain('https://example.test/courses/sample');
  });
});

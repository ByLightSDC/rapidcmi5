import { afterEach, describe, expect, it, vi } from 'vitest';
import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';
import AdmZip from 'adm-zip';
import { registerBuildMoodle } from './buildMoodle';

const { uploadCourse } = vi.hoisted(() => ({ uploadCourse: vi.fn() }));

vi.mock('../services/moodle/moodleUploadServiceV2', () => ({
  MoodleUploadServiceV2: class {
    uploadCourse = uploadCourse;
  },
}));

describe('build-moodle', () => {
  const originalToken = process.env['MOODLE_WS_TOKEN'];
  let temporaryDirectory: string | undefined;

  afterEach(async () => {
    if (temporaryDirectory) {
      await fs.rm(temporaryDirectory, { recursive: true, force: true });
      temporaryDirectory = undefined;
    }
    if (originalToken === undefined) delete process.env['MOODLE_WS_TOKEN'];
    else process.env['MOODLE_WS_TOKEN'] = originalToken;
    uploadCourse.mockReset();
  });

  it('converts MkDocs, packages the course, and passes it to the Moodle uploader', async () => {
    temporaryDirectory = await fs.mkdtemp(
      path.join(tmpdir(), 'cmi5-moodle-test-'),
    );
    const coursePath = path.join(temporaryDirectory, 'course');
    const playerPath = path.join(temporaryDirectory, 'player');
    const zipPath = path.join(temporaryDirectory, 'course.zip');
    await fs.mkdir(path.join(coursePath, 'docs'), { recursive: true });
    await fs.mkdir(playerPath);
    await fs.writeFile(
      path.join(coursePath, 'mkdocs.yml'),
      'site_name: Moodle Course\nrepo_url: https://example.test/course\nnav:\n  - Lesson: lesson.md\n',
    );
    await fs.writeFile(path.join(coursePath, 'docs', 'lesson.md'), '# Lesson');
    await fs.writeFile(path.join(playerPath, 'index.html'), '<base href="/">');
    await fs.writeFile(path.join(playerPath, 'cfg.json'), '{}');
    await fs.writeFile(path.join(playerPath, 'favicon.ico'), 'icon');
    process.env['MOODLE_WS_TOKEN'] = 'test-token';

    const program = new Command();
    registerBuildMoodle(program);
    await program.parseAsync(
      [
        'build-moodle',
        coursePath,
        playerPath,
        'https://moodle.example.test',
        '--convert',
        '--zip',
        zipPath,
      ],
      { from: 'user' },
    );

    expect(uploadCourse).toHaveBeenCalledWith({
      projectIdentifier: 'https://example.test/course',
      projectName: 'Moodle Course',
      zipPath,
    });
    const zip = new AdmZip(zipPath);
    expect(zip.getEntry('cmi5.xml')).toBeTruthy();
    expect(
      zip.getEntry('compiled_course/blocks/moodle-course/lesson.md'),
    ).toBeTruthy();
  });
});

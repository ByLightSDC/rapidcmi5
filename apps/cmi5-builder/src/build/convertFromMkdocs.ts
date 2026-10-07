import path from 'path';
import fs from 'fs/promises';
import yaml from 'js-yaml';
import {
  cleanMkdocs,
  CourseAU,
  CourseBlock,
  CourseData,
  FolderStruct,
  generateCourseJson,
  RC5_VERSION,
  sanitizeName,
  SlideType,
} from '@rapid-cmi5/cmi5-build-common';

type NavEntry = Record<string, string | NavEntry[]>;
type SlideEntry = {
  title: string;
  sourcePath: string;
  ancestors: string[];
};

type MkdocsConfig = {
  site_name?: string;
  repo_url?: string;
  docs_dir?: string;
  nav?: NavEntry[];
};

function parseMkdocsConfig(folderStructure: FolderStruct[]): MkdocsConfig {
  const file = folderStructure.find(
    (node) => node.name === 'mkdocs.yaml' || node.name === 'mkdocs.yml',
  );
  if (!file?.content) {
    throw new Error('mkdocs.yaml or mkdocs.yml not found in the course folder');
  }

  // MkDocs permits this Python YAML tag, which js-yaml cannot resolve.
  const content = file.content
    .toString()
    .replaceAll(
      'format: !!python/name:pymdownx.superfences.fence_code_format',
      '',
    );
  const config = yaml.load(content) as MkdocsConfig;
  if (!Array.isArray(config?.nav)) {
    throw new Error(`${file.name} has no nav list`);
  }
  return config;
}

function collectSlides(
  nav: NavEntry[],
  ancestors: string[] = [],
): SlideEntry[] {
  const slides: SlideEntry[] = [];
  for (const entry of nav) {
    for (const [title, value] of Object.entries(entry)) {
      if (Array.isArray(value)) {
        slides.push(...collectSlides(value, [...ancestors, title]));
      } else if (
        typeof value === 'string' &&
        /\.md(?:own)?(?:#.*)?$/i.test(value)
      ) {
        slides.push({ title, sourcePath: value.split('#')[0], ancestors });
      }
    }
  }
  return slides;
}

function indexFiles(
  nodes: FolderStruct[],
  prefix = '',
): Map<string, FolderStruct> {
  const files = new Map<string, FolderStruct>();
  for (const node of nodes) {
    const filename = path.posix.join(prefix, node.name);
    if (node.isBranch) {
      for (const [name, file] of indexFiles(node.children ?? [], filename)) {
        files.set(name, file);
      }
    } else {
      files.set(filename, node);
    }
  }
  return files;
}

function uniqueName(name: string, used: Set<string>): string {
  const base = sanitizeName(name) || 'untitled';
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${suffix++}`;
  }
  used.add(candidate);
  return candidate;
}

function uniqueFilename(filename: string, used: Set<string>): string {
  const extension = path.posix.extname(filename);
  const stem = filename.slice(0, -extension.length);
  let candidate = filename;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${stem}-${suffix++}${extension}`;
  }
  used.add(candidate);
  return candidate;
}

function rebaseLinks(
  markdown: string,
  sourcePath: string,
  destinationDir: string,
  slidePaths: Map<string, string>,
): string {
  function rebase(reference: string): string {
    if (/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(reference)) return reference;
    const match = /^([^?#]*)([?#].*)?$/.exec(reference);
    if (!match?.[1]) return reference;

    const sourceTarget = path.posix.normalize(
      path.posix.join(path.posix.dirname(sourcePath), match[1]),
    );
    const destination = sourceTarget.startsWith('assets/')
      ? path.posix.join('_assets', sourceTarget.slice('assets/'.length))
      : slidePaths.get(sourceTarget);
    if (!destination) return reference;

    return `${path.posix.relative(destinationDir, destination)}${match[2] ?? ''}`;
  }

  return markdown
    .replace(
      /(\b(?:src|href)\s*=\s*["'])([^"']+)(["'])/gi,
      (_match, before, reference, after) =>
        `${before}${rebase(reference)}${after}`,
    )
    .replace(/(\]\()([^\)]+)(\))/g, (_match, before, target, after) => {
      const title = /^(.*?)(\s+"[^"]*")$/.exec(target);
      const reference = title ? title[1] : target;
      return `${before}${rebase(reference)}${title?.[2] ?? ''}${after}`;
    });
}

export async function convertFromMkdocs(
  inputPath: string,
  folderStructure: FolderStruct[],
  stagingPath: string,
): Promise<CourseData> {
  const config = parseMkdocsConfig(folderStructure);
  const docsDir = config.docs_dir ?? 'docs';
  const courseTitle = config.site_name ?? 'MKDOCS Course';
  const files = indexFiles(folderStructure);
  const auDirs = new Set<string>();
  const blocks = new Map<string, CourseBlock>();
  const slidePaths = new Map<string, string>();
  const stagedSlides: Array<{
    sourcePath: string;
    destination: string;
    content: string;
  }> = [];

  for (const entry of collectSlides(config.nav!)) {
    const sourcePath = path.posix.normalize(entry.sourcePath);
    const sourceFile = files.get(path.posix.join(docsDir, sourcePath));
    if (!sourceFile) {
      console.warn(
        'Could not find slide:',
        path.posix.join(docsDir, sourcePath),
      );
      continue;
    }

    const auName = entry.ancestors.at(-1) ?? courseTitle;
    const blockAncestors = entry.ancestors.slice(0, -1);
    const blockName = blockAncestors.length
      ? blockAncestors.join(' / ')
      : courseTitle;
    const blockKey = JSON.stringify(blockAncestors);
    let block = blocks.get(blockKey);
    if (!block) {
      block = { blockName, aus: [] };
      blocks.set(blockKey, block);
    }

    let au = block.aus.find((item) => item.auName === auName);
    if (!au) {
      au = {
        auName,
        dirPath: uniqueName(auName, auDirs),
        slides: [],
      } as CourseAU;
      block.aus.push(au);
    }

    const usedNames = new Set(
      au.slides.map((slide) => path.posix.basename(slide.filepath)),
    );
    const filename = uniqueFilename(path.posix.basename(sourcePath), usedNames);
    const destination = path.posix.join(au.dirPath, filename);
    const slide: SlideType = {
      filepath: destination,
      slideTitle: entry.title,
      content: '',
    };
    au.slides.push(slide);
    slidePaths.set(sourcePath, destination);
    stagedSlides.push({
      sourcePath,
      destination,
      content: sourceFile.content?.toString() ?? '',
    });
  }

  const courseFile: CourseData = {
    courseId: config.repo_url ?? 'https://ros/mkdocs',
    courseTitle,
    rc5Version: RC5_VERSION,
    blocks: [...blocks.values()],
  };
  const convertedFiles: FolderStruct[] = [
    {
      id: 'RC5.yaml',
      name: 'RC5.yaml',
      isBranch: false,
      content: JSON.stringify(courseFile),
    },
  ];

  for (const slide of stagedSlides) {
    const destinationDir = path.posix.dirname(slide.destination);
    const content = rebaseLinks(
      cleanMkdocs(slide.content, slide.sourcePath),
      slide.sourcePath,
      destinationDir,
      slidePaths,
    );
    const destination = path.join(stagingPath, slide.destination);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, content);
    convertedFiles.push({
      id: slide.destination,
      name: path.posix.basename(slide.destination),
      isBranch: false,
      content,
    });
  }

  const assetsSource = path.join(inputPath, docsDir, 'assets');
  try {
    await fs.cp(assetsSource, path.join(stagingPath, '_assets'), {
      recursive: true,
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  await fs.writeFile(
    path.join(stagingPath, 'RC5.yaml'),
    JSON.stringify(courseFile, null, 2),
  );

  const courseData = generateCourseJson(convertedFiles);
  if (!courseData)
    throw new Error('Could not generate course data from MkDocs navigation');
  return courseData;
}

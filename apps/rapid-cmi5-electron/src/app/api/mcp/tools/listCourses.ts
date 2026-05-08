import { promises as fsp, Dirent } from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { z } from 'zod/v4';
import { RC5_FILENAME, CourseData } from '@rapid-cmi5/cmi5-build-common';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpContext } from '../context';

export function registerListCourses(server: McpServer, ctx: McpContext): void {
  server.registerTool(
    'rc5_list_courses',
    {
      title: 'List courses',
      description:
        "List every authored course in the workspace. A course is a directory containing an RC5.yaml manifest, nested one level inside a project. Returns each course's title, path, and parent project. Use this as the starting point whenever the user references a course. Pass coursePath into rc5_get_course to see structure.",
      inputSchema: {},
      outputSchema: {
        courses: z.array(
          z.object({
            coursePath: z
              .string()
              .describe(
                'Relative path from the workspace root. Use this as the coursePath argument to rc5_get_course.',
              ),
            courseTitle: z
              .string()
              .describe('Human-readable course title from RC5.yaml.'),
            project: z
              .string()
              .describe('Parent project (repo) directory name.'),
          }),
        ),
      },
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
      },
    },
    async () => {
      const courses: Array<{
        coursePath: string;
        courseTitle: string;
        project: string;
      }> = [];

      const topLevel = await fsp.readdir(ctx.rootDir, { withFileTypes: true });
      for (const project of topLevel) {
        if (!project.isDirectory() || project.name.startsWith('.')) continue;
        const projectAbs = path.join(ctx.rootDir, project.name);

        let projectChildren: Dirent[];
        try {
          projectChildren = await fsp.readdir(projectAbs, {
            withFileTypes: true,
          });
        } catch {
          continue;
        }

        for (const child of projectChildren) {
          if (!child.isDirectory() || child.name.startsWith('.')) continue;
          const manifestAbs = path.join(projectAbs, child.name, RC5_FILENAME);

          try {
            const raw = await fsp.readFile(manifestAbs, 'utf-8');
            const data = (YAML.parse(raw) ?? {}) as Partial<CourseData>;
            const courseTitle =
              typeof data.courseTitle === 'string'
                ? data.courseTitle
                : child.name;
            courses.push({
              coursePath: `${project.name}/${child.name}`,
              courseTitle,
              project: project.name,
            });
          } catch {
            // Not a course (no manifest, or malformed) — skip silently.
          }
        }
      }

      courses.sort((a, b) => a.courseTitle.localeCompare(b.courseTitle));

      const result = { courses };
      return {
        content: [
          {
            type: 'text',
            text: courses.length
              ? `Found ${courses.length} course(s):\n${courses
                  .map((c) => `- ${c.courseTitle} (${c.coursePath})`)
                  .join('\n')}`
              : '(no courses found)',
          },
        ],
        structuredContent: result,
      };
    },
  );
}

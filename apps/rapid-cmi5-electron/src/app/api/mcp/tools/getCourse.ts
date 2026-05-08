import { promises as fsp } from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { z } from 'zod/v4';
import {
  CourseData,
  CourseDataSchemaZod,
  RC5_FILENAME,
} from '@rapid-cmi5/cmi5-build-common';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpContext } from '../context';

export function registerGetCourse(server: McpServer, ctx: McpContext): void {
  server.registerTool(
    'rc5_get_course',
    {
      title: 'Get course',
      description:
        "Read a course's full structure: title, description, and the block → lesson → slide tree. Slide markdown bodies are NOT returned. Use this to understand a course's composition or locate a lesson/slide by name. To read a slide's content, use the host's Read tool on \"<projectDir>/<slide.filepath>\". To edit the slide currently open in the editor, use rc5_read_current_slide / rc5_update_current_slide.",
      inputSchema: {
        coursePath: z
          .string()
          .describe(
            'Course handle from rc5_list_courses (e.g. "project-1/course-1").',
          ),
      },
      outputSchema: CourseDataSchemaZod,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
      },
    },
    async ({ coursePath }) => {
      if (!coursePath || coursePath === '.' || coursePath === '/') {
        return {
          content: [
            {
              type: 'text',
              text: 'coursePath is required. Pass a value from rc5_list_courses, e.g. "project-1/course-1".',
            },
          ],
          isError: true,
        };
      }

      const courseAbs = path.resolve(ctx.rootDir, coursePath);
      if (!courseAbs.startsWith(ctx.rootDir + path.sep)) {
        return {
          content: [
            {
              type: 'text',
              text: `coursePath escapes workspace root: ${coursePath}`,
            },
          ],
          isError: true,
        };
      }

      const manifestPath = path.join(courseAbs, RC5_FILENAME);
      const raw = await fsp.readFile(manifestPath, 'utf-8');
      const data = (YAML.parse(raw) ?? {}) as Partial<CourseData>;

      const merged = {
        ...data,
        courseTitle:
          typeof data.courseTitle === 'string' ? data.courseTitle : coursePath,
        courseId: typeof data.courseId === 'string' ? data.courseId : '',
        blocks: Array.isArray(data.blocks) ? data.blocks : [],
      };

      const validated = CourseDataSchemaZod.safeParse(merged);
      if (!validated.success) {
        const issues = validated.error.issues
          .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
          .join('\n');
        return {
          content: [
            {
              type: 'text',
              text: `Course "${coursePath}" has a malformed RC5.yaml (does not match CourseDataSchema):\n${issues}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          { type: 'text', text: JSON.stringify(validated.data, null, 2) },
        ],
        structuredContent: validated.data,
      };
    },
  );
}

import { promises as fsp } from 'fs';
import { z } from 'zod/v4';
import {
  CourseData,
  CreateCourseInputSchema,
} from '@rapid-cmi5/cmi5-build-common';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { requestFromRenderer, RendererReply } from '../rendererBridge';
import type { McpContext } from '../context';
import {
  formatValidationError,
  validateCourseDirectives,
} from '../directiveValidation';

const CREATE_COURSE_TIMEOUT_MS = 120_000;

export function registerCreateCourse(server: McpServer, ctx: McpContext): void {
  server.registerTool(
    'rc5_create_course',
    {
      title: 'Create course',
      description:
        "Scaffold an entire course inside an existing project, atomically. Provide a CourseData object (title, courseId, blocks → AUs → slides) PLUS the `repoName` of the target project. The renderer creates the directory tree, writes RC5.yaml, and writes each slide's `.md` file in one shot. After this returns the new course is loaded and active in the editor; further edits should go through rc5_update_current_slide / rc5_save_course. Call rc5_list_projects first to pick a valid repoName.",
      inputSchema: CreateCourseInputSchema.shape,
      outputSchema: {
        ok: z.boolean(),
      },
    },
    async (args) => {
      const win = ctx.getMainWindow();
      if (!win || win.isDestroyed()) {
        return {
          content: [
            {
              type: 'text',
              text: 'No editor window is currently available.',
            },
          ],
          isError: true,
        };
      }

      const { repoName, ...courseFields } = args as {
        repoName: string;
      } & CourseData;

      const validation = validateCourseDirectives(courseFields);
      if (!validation.ok) {
        return {
          content: [
            {
              type: 'text',
              text: formatValidationError(
                'One or more slides contain malformed activity directives. Fix and retry:',
                validation.errors,
              ),
            },
          ],
          isError: true,
        };
      }

      const entries = await fsp.readdir(ctx.rootDir, { withFileTypes: true });
      const validRepos = entries
        .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
        .map((e) => e.name);
      if (!validRepos.includes(repoName)) {
        return {
          content: [
            {
              type: 'text',
              text: `Unknown project "${repoName}". Call rc5_list_projects to see options${
                validRepos.length
                  ? `: ${validRepos.join(', ')}`
                  : ' (none — create a project first)'
              }.`,
            },
          ],
          isError: true,
        };
      }

      const reply = await requestFromRenderer<RendererReply>(win, {
        sendChannel: 'course:createCourse',
        replyChannel: 'course:createCourse:done',
        payload: { course: courseFields, repoName },
        timeoutMs: CREATE_COURSE_TIMEOUT_MS,
      });

      if (!reply.ok) {
        return {
          content: [
            {
              type: 'text',
              text: reply.error ?? 'The editor failed to create the course.',
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Created course "${courseFields.courseTitle}" in project "${repoName}".`,
          },
        ],
        structuredContent: { ok: true },
      };
    },
  );
}

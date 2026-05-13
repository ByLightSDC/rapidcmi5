import { promises as fsp } from 'fs';
import { z } from 'zod/v4';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpContext } from '../context';

export function registerListProjects(server: McpServer, ctx: McpContext): void {
  server.registerTool(
    'rc5_list_projects',
    {
      title: 'List projects',
      description:
        'List the projects (top-level repo directories) in the workspace. A project is a container that may hold zero or more courses. Use this when you need a project name to scaffold a new course (input to rc5_create_course). For listing actual courses, use rc5_list_courses instead.',
      inputSchema: {},
      outputSchema: {
        projects: z
          .array(z.string())
          .describe(
            'Project directory names. Empty array if no projects exist yet.',
          ),
      },
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
      },
    },
    async () => {
      const entries = await fsp.readdir(ctx.rootDir, { withFileTypes: true });
      const projects = entries
        .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
        .map((e) => e.name)
        .sort();

      const result = { projects };
      return {
        content: [
          {
            type: 'text',
            text: projects.length
              ? `Found ${projects.length} project(s):\n${projects.join('\n')}`
              : '(no projects found)',
          },
        ],
        structuredContent: result,
      };
    },
  );
}

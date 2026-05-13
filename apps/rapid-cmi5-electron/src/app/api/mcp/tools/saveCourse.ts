import { z } from 'zod/v4';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { requestFromRenderer, RendererReply } from '../rendererBridge';
import type { McpContext } from '../context';

interface SaveCourseReply extends RendererReply {
  changedFiles?: string[];
}

const SAVE_TIMEOUT_MS = 120_000;

export function registerSaveCourse(server: McpServer, ctx: McpContext): void {
  server.registerTool(
    'rc5_save_course',
    {
      title: 'Save course',
      description:
        "Persist the open course's unsaved edits to disk. Call this after a series of mutations (rc5_update_current_slide, etc.) so the user's work is durably saved. The user can also save manually; calling this redundantly when there's nothing to flush is harmless. Returns the list of files written.",
      inputSchema: {},
      outputSchema: {
        ok: z.boolean(),
        changedFiles: z
          .array(z.string())
          .describe(
            'Files modified on disk during this save (relative paths). Empty if nothing was dirty.',
          ),
      },
      annotations: {
        idempotentHint: true,
      },
    },
    async () => {
      const win = ctx.getMainWindow();
      if (!win || win.isDestroyed()) {
        return {
          content: [
            {
              type: 'text',
              text: 'No editor window is currently available. The user may not have a course open.',
            },
          ],
          isError: true,
        };
      }

      const reply = await requestFromRenderer<SaveCourseReply>(win, {
        sendChannel: 'course:saveCourse',
        replyChannel: 'course:saveCourse:done',
        timeoutMs: SAVE_TIMEOUT_MS,
      });

      if (!reply.ok) {
        return {
          content: [
            {
              type: 'text',
              text: reply.error ?? 'The editor failed to save the course.',
            },
          ],
          isError: true,
        };
      }

      const changedFiles = reply.changedFiles ?? [];
      const summary = changedFiles.length
        ? `Saved. ${changedFiles.length} file(s) changed:\n${changedFiles
            .map((f) => `- ${f}`)
            .join('\n')}`
        : 'Saved. No changes to flush.';

      return {
        content: [{ type: 'text', text: summary }],
        structuredContent: { ok: true, changedFiles },
      };
    },
  );
}

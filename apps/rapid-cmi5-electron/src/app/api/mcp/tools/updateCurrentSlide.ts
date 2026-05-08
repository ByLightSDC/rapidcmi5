import { z } from 'zod/v4';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { requestFromRenderer, RendererReply } from '../rendererBridge';
import type { McpContext } from '../context';
import {
  formatValidationError,
  validateDirectivesInMarkdown,
} from '../directiveValidation';

export function registerUpdateCurrentSlide(
  server: McpServer,
  ctx: McpContext,
): void {
  server.registerTool(
    'rc5_update_current_slide',
    {
      title: 'Update current slide',
      description:
        "Replace the markdown of the slide currently open in the editor. Use this for any 'update', 'rewrite', 'improve', 'fix', or 'add to' request targeting the current slide. The change appears LIVE in the editor — not yet saved to disk; call rc5_save_course afterward (or let the user save) to persist. The editor validates YAML frontmatter before accepting; malformed input is rejected with an error you should report back to the user.",
      inputSchema: {
        markdown: z
          .string()
          .describe(
            'Full markdown content to write into the current slide. PRESERVE any existing YAML frontmatter (between `---` markers at the top) unless the user explicitly asked to change it. To see what is currently there before replacing, call rc5_read_current_slide first.',
          ),
      },
      outputSchema: {
        ok: z.boolean(),
      },
      annotations: {
        idempotentHint: true,
      },
    },
    async ({ markdown }) => {
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

      const validation = validateDirectivesInMarkdown(markdown);
      if (!validation.ok) {
        return {
          content: [
            {
              type: 'text',
              text: formatValidationError(
                'The slide markdown contains malformed activity directives:',
                validation.errors,
              ),
            },
          ],
          isError: true,
        };
      }

      const reply = await requestFromRenderer<RendererReply>(win, {
        sendChannel: 'slide:updateCurrent',
        replyChannel: 'slide:updateCurrent:done',
        payload: { markdown },
      });

      if (!reply.ok) {
        return {
          content: [
            {
              type: 'text',
              text:
                reply.error ?? 'The editor failed to update the current slide.',
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text', text: 'Updated current slide.' }],
        structuredContent: { ok: true },
      };
    },
  );
}

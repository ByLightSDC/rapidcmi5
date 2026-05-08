import { z } from 'zod/v4';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { requestFromRenderer, RendererReply } from '../rendererBridge';
import type { McpContext } from '../context';

interface ReadCurrentSlideReply extends RendererReply {
  markdown?: string;
}

export function registerReadCurrentSlide(
  server: McpServer,
  ctx: McpContext,
): void {
  server.registerTool(
    'rc5_read_current_slide',
    {
      title: 'Read current slide',
      description:
        "Read the markdown of the slide currently open in the editor. Use this when the user asks about 'this slide', 'the current slide', or wants to refer to whatever they're looking at right now. The returned markdown reflects live editor state and may include unsaved edits.",
      inputSchema: {},
      outputSchema: {
        markdown: z
          .string()
          .describe(
            'Markdown body of the current slide, including any unsaved edits.',
          ),
      },
      annotations: {
        readOnlyHint: true,
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

      const reply = await requestFromRenderer<ReadCurrentSlideReply>(win, {
        sendChannel: 'slide:readCurrent',
        replyChannel: 'slide:readCurrent:done',
      });

      if (!reply.ok) {
        return {
          content: [
            {
              type: 'text',
              text:
                reply.error ?? 'The editor failed to read the current slide.',
            },
          ],
          isError: true,
        };
      }

      const markdown = reply.markdown ?? '';
      return {
        content: [{ type: 'text', text: markdown }],
        structuredContent: { markdown },
      };
    },
  );
}

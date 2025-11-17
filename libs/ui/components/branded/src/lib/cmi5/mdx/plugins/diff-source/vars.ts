import { Cell } from '@mdxeditor/editor';

export const markdownProcessingError$ = Cell<{
  error: string;
  source: string;
} | null>(null);

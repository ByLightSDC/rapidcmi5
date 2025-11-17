import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';

import {
  CodeBlockEditorDescriptor,
  CodeBlockEditorProps,
} from '@mdxeditor/editor';

/**
 * Math Editor for display math
 */
export const MathCodeBlockDescriptor: CodeBlockEditorDescriptor = {
  priority: 1,
  match(language: string | null | undefined, meta: string | null | undefined) {
    return language === 'math';
  },
  Editor: (props: CodeBlockEditorProps) => {
    //console.log('props', props);
    const { code } = props;

    return (
      <Markdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
      >
        {`$$\n${code}\n$$`}
      </Markdown>
    );
  },
};

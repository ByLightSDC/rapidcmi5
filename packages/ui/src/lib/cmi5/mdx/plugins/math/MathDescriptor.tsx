import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import { MathEditorDescriptor } from '../../plugins/math/MathEditorContext';
import { MathEditorProps } from '../../plugins/math/MathNode';
import { inlineMathParser } from './MathParsers';

/**
 * Math Editor for inline math
 * https://katex.org/docs/supported.html
 */
export const MathDescriptor: MathEditorDescriptor = {
  priority: 1,
  match(language: string | null | undefined, meta: string | null | undefined) {
    return language === 'math';
  },
  Editor: (props: MathEditorProps) => {
    const { code, isInline } = props;
    console.log('MathDescriptor isInline=', isInline);
    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {isInline ? (
          <Markdown
            components={inlineMathParser()}
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {`$$${code}$$`}
          </Markdown>
        ) : (
          <Markdown
            components={isInline ? inlineMathParser() : undefined}
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {`$$\n${code}\n$$`}
          </Markdown>
        )}
      </>
    );
  },
};

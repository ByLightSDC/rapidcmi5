import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { remarkAdmonitions } from './AdmonitionsPlugIn';
import { customRemarkPlugin } from './CustomPlugIn';
import { customRemarkToc } from './CustomRemarkToc';
import { imagePlugin } from './ImagePlugin';
import { linkPlugin } from './LinkPlugin';
import { customMarkdownParser } from './MarkDownParser';
import { remarkQuizDown } from './QuizDownPlugIn';
import { AuContextProps } from '@rapid-cmi5/cmi5-build-common';
import { remarkKeyboardPlugin } from './KeyboardPlugin';
import { markDownSlideStyle } from './styles';

export function MarkdownConvertorSlide({
  markdown,
  auProps,
  lookupState,
}: {
  markdown: string;
  auProps?: AuContextProps;
  lookupState?: any;
}) {
  return (
    <Markdown
      remarkPlugins={[
        //REF debugPlugin,
        linkPlugin,
        imagePlugin,
        remarkGfm,
        remarkMath,
        remarkAdmonitions,
        remarkDirective,
        customRemarkPlugin,
        customRemarkToc,
        remarkQuizDown,
        remarkKeyboardPlugin,
      ]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={customMarkdownParser(auProps, lookupState)}
    >
      {markdown}
    </Markdown>
  );
}

export function MarkdownConvertorQuiz({
  markdown,
  auProps,
  lookupState,
  className = '',
}: {
  markdown: string;
  auProps?: AuContextProps;
  lookupState?: any;
  className?: string;
}) {
  return (
    <div className={`w-full max-w-none text-left ${className}`}>
      {markDownSlideStyle}
      <Markdown
        remarkPlugins={[
          //REF debugPlugin,
          linkPlugin,
          imagePlugin,
          remarkGfm,
          remarkMath,
          remarkAdmonitions,
          remarkDirective,
          customRemarkPlugin,
          remarkKeyboardPlugin,
        ]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={customMarkdownParser(auProps, lookupState)}
      >
        {markdown}
      </Markdown>
    </div>
  );
}

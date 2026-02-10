import { useMemo, useRef } from 'react';

export type TextAlign = 'left' | 'center' | 'right';

export const useScopedAlignmentStyles = (
  textAlign: TextAlign,
  classPrefix: string,
) => {
  const scopedClass = useRef(
    `${classPrefix}-${Math.random().toString(36).slice(2, 9)}`,
  ).current;

  const justifyContent = useMemo(() => {
    if (textAlign === 'center') return 'center';
    if (textAlign === 'right') return 'flex-end';
    return 'flex-start';
  }, [textAlign]);

  const alignmentStyles = useMemo(() => {
    if (textAlign === 'left') return null;
    return (
      <style>{`
        .${scopedClass} {
          display: flex;
          flex-direction: row;
          justify-content: ${justifyContent};
          flex-wrap: wrap;
          gap: 0;
          list-style-position: inside;
        }

        .${scopedClass} p,
        .${scopedClass} [data-lexical-paragraph="true"],
        .${scopedClass} ul,
        .${scopedClass} ol,
        .${scopedClass} blockquote,
        .${scopedClass} h1,
        .${scopedClass} h2,
        .${scopedClass} h3,
        .${scopedClass} h4,
        .${scopedClass} h5,
        .${scopedClass} h6 {
          flex: 0 0 100%;
          min-width: 100%;
          text-align: ${textAlign};
        }

        .${scopedClass} ul,
        .${scopedClass} ol {
          padding-inline-start: 0;
        }

        .${scopedClass} li[role="checkbox"] {
          text-align: ${textAlign};
          margin-inline-start: 0;
        }

        .${scopedClass} [data-lexical-decorator="true"] {
          flex: 0 0 auto;
          min-width: auto;
        }
      `}</style>
    );
  }, [justifyContent, scopedClass, textAlign]);

  return { scopedClass, alignmentStyles };
};

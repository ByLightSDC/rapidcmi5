import { useMemo, useRef } from 'react';

export type TextAlign = 'left' | 'center' | 'right';

export const useScopedAlignmentStyles = (
  textAlign: TextAlign,
  classPrefix: string,
) => {
  const scopedClass = useRef(
    `${classPrefix}-${Math.random().toString(36).slice(2, 9)}`,
  ).current;

  const alignmentStyles = useMemo(() => {
    if (textAlign === 'left') return null;
    return (
      <style>{`
        .${scopedClass} {
          text-align: ${textAlign};
          list-style-position: inside;
        }

        .${scopedClass} ul,
        .${scopedClass} ol {
          padding-inline-start: 0;
        }

        .${scopedClass} li[role="checkbox"] {
          text-align: ${textAlign};
          margin-inline-start: 0;
        }
      `}</style>
    );
  }, [scopedClass, textAlign]);

  return { scopedClass, alignmentStyles };
};

import {
  applyFormat$,
  currentFormat$,
  FORMAT,
  iconComponentFor$,
  IconKey,
  IS_BOLD,
  IS_CODE,
  IS_ITALIC,
  IS_UNDERLINE,
  useTranslation,
} from '@mdxeditor/editor';

import { FormatButton } from './FormatButton';



/**
 * A toolbar component that lets the user toggle bold, italic and underline formatting.
 * @group Toolbar Components
 */
export const BoldItalicUnderlineToggles = () => {
  const t = useTranslation();

  return (
    <div>
      <FormatButton
        format={IS_BOLD}
        addTitle={t('toolbar.bold', 'Bold')}
        removeTitle={t('toolbar.removeBold', 'Remove bold')}
        icon="format_bold"
        formatName="bold"
      />

      <FormatButton
        format={IS_ITALIC}
        addTitle={t('toolbar.italic', 'Italic')}
        removeTitle={t('toolbar.removeItalic', 'Remove italic')}
        icon="format_italic"
        formatName="italic"
      />

      <FormatButton
        format={IS_UNDERLINE}
        addTitle={t('toolbar.underline', 'Underline')}
        removeTitle={t('toolbar.removeUnderline', 'Remove underline')}
        icon="format_underlined"
        formatName="underline"
      />

      <FormatButton
        format={IS_CODE}
        addTitle={t('toolbar.inlineCode', 'Inline code format')}
        removeTitle={t('toolbar.removeInlineCode', 'Remove code format')}
        icon="code"
        formatName="code"
      />
    </div>
  );
};

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
import { Stack } from '@mui/material';

/**
 * A toolbar component that lets the user toggle bold, italic and underline formatting.
 * @group Toolbar Components
 */
export const BoldItalicUnderlineToggles = () => {
  const t = useTranslation();

  return (
    <Stack direction="row" spacing={0.5}>
      <FormatButton
        format={IS_BOLD}
        addTitle={t('toolbar.bold', 'Bold')}
        removeTitle={t('toolbar.removeBold', 'Remove Bold')}
        icon="format_bold"
        formatName="bold"
      />

      <FormatButton
        format={IS_ITALIC}
        addTitle={t('toolbar.italic', 'Italic')}
        removeTitle={t('toolbar.removeItalic', 'Remove Italic')}
        icon="format_italic"
        formatName="italic"
      />

      <FormatButton
        format={IS_UNDERLINE}
        addTitle={t('toolbar.underline', 'Underline')}
        removeTitle={t('toolbar.removeUnderline', 'Remove Underline')}
        icon="format_underlined"
        formatName="underline"
      />

      <FormatButton
        format={IS_CODE}
        addTitle={t('toolbar.inlineCode', 'Inline Code Format')}
        removeTitle={t('toolbar.removeInlineCode', 'Remove Code Format')}
        icon="code"
        formatName="code"
      />
    </Stack>
  );
};

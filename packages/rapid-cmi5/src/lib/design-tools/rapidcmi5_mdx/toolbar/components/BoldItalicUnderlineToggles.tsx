import {
  applyFormat$,
  currentFormat$,
  FORMAT,
  iconComponentFor$,
  IconKey,
  IS_BOLD,
  IS_ITALIC,
  IS_UNDERLINE,
  useCellValues,
  usePublisher,
  useTranslation,
} from '@mdxeditor/editor';
import { TextFormatType } from 'lexical';
import { MUIToggleSingleGroupWithItem } from './MUIToggleSingleGroupWithItem';

interface FormatButtonProps {
  format: FORMAT;
  addTitle: string;
  removeTitle: string;
  icon: IconKey;
  formatName: TextFormatType;
}

const FormatButton: React.FC<FormatButtonProps> = ({
  format,
  addTitle,
  removeTitle,
  icon,
  formatName,
}) => {
  const [currentFormat, iconComponentFor] = useCellValues(
    currentFormat$,
    iconComponentFor$,
  );
  const applyFormat = usePublisher(applyFormat$);
  const active = (currentFormat & format) !== 0;

  return (
    <MUIToggleSingleGroupWithItem
      title={active ? removeTitle : addTitle}
      on={active}
      onClick={() => {
        applyFormat(formatName);
      }}
      sx={{padding:'0px', marginRight:'2px'}}
    >
      {iconComponentFor(icon)}
    </MUIToggleSingleGroupWithItem>
  );
};

export interface BoldItalicUnderlineTogglesProps {
  options?: ('Bold' | 'Italic' | 'Underline')[];
}

/**
 * A toolbar component that lets the user toggle bold, italic and underline formatting.
 * @group Toolbar Components
 */
export const BoldItalicUnderlineToggles: React.FC<
  BoldItalicUnderlineTogglesProps
> = ({ options }) => {
  const t = useTranslation();

  const showAllButtons = typeof options === 'undefined';
  //className={styles.toolbarGroupOfGroups}
  return (
    <div>
      {showAllButtons || options.includes('Bold') ? (
        <FormatButton
          format={IS_BOLD}
          addTitle={t('toolbar.bold', 'Bold')}
          removeTitle={t('toolbar.removeBold', 'Remove bold')}
          icon="format_bold"
          formatName="bold"
        />
      ) : null}
      {showAllButtons || options.includes('Italic') ? (
        <FormatButton
          format={IS_ITALIC}
          addTitle={t('toolbar.italic', 'Italic')}
          removeTitle={t('toolbar.removeItalic', 'Remove italic')}
          icon="format_italic"
          formatName="italic"
        />
      ) : null}
      {showAllButtons || options.includes('Underline') ? (
        <FormatButton
          format={IS_UNDERLINE}
          addTitle={t('toolbar.underline', 'Underline')}
          removeTitle={t('toolbar.removeUnderline', 'Remove underline')}
          icon="format_underlined"
          formatName="underline"
        />
      ) : null}
    </div>
  );
};

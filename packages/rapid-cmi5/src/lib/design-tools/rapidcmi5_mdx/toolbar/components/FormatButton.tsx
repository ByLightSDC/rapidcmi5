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

export const FormatButton: React.FC<FormatButtonProps> = ({
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
      //sx={{padding:'0px', marginRight:'2px'}}
    >
      {iconComponentFor(icon)}
    </MUIToggleSingleGroupWithItem>
  );
};
import { IconButton, Tooltip } from '@mui/material';
import VerticalAlignCenterIcon from '@mui/icons-material/VerticalAlignCenter';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';

export interface AlignmentToolbarControlsProps {
  currentAlignment: string;
  onAlignmentChange: (value: 'left' | 'center' | 'right') => void;
  disabled?: boolean;
}

const ALIGNMENT_OPTIONS = [
  {
    value: 'left' as const,
    label: 'Align Left',
    icon: (
      <VerticalAlignBottomIcon
        fontSize="small"
        sx={{ transform: 'rotate(90deg)' }}
      />
    ),
  },
  {
    value: 'center' as const,
    label: 'Align Center',
    icon: (
      <VerticalAlignCenterIcon
        fontSize="small"
        sx={{ transform: 'rotate(90deg)' }}
      />
    ),
  },
  {
    value: 'right' as const,
    label: 'Align Right',
    icon: (
      <VerticalAlignTopIcon
        fontSize="small"
        sx={{ transform: 'rotate(90deg)' }}
      />
    ),
  },
];

/**
 * Reusable alignment toolbar controls (left / center / right).
 * Designed for use inside directive editors that wrap a NestedLexicalEditor.
 */
export function AlignmentToolbarControls({
  currentAlignment,
  onAlignmentChange,
  disabled = false,
}: AlignmentToolbarControlsProps) {
  return (
    <>
      {ALIGNMENT_OPTIONS.map((opt) => (
        <Tooltip key={opt.value} arrow title={opt.label}>
          <IconButton
            aria-label={opt.label}
            disabled={disabled}
            color={currentAlignment === opt.value ? 'primary' : 'default'}
            onClick={() => onAlignmentChange(opt.value)}
            size="small"
          >
            {opt.icon}
          </IconButton>
        </Tooltip>
      ))}
    </>
  );
}

import { alpha, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

/** Shared add action for the course and branch dropdowns. */
export function DrawerAddButton({
  label,
  tooltip = label,
  id,
  disabled,
  onClick,
}: {
  label: string;
  tooltip?: string;
  id: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip title={tooltip}>
      <span>
        <IconButton
          aria-label={label}
          id={id}
          data-testid={id}
          disabled={disabled}
          onClick={onClick}
          size="small"
          sx={(theme) => ({
            backgroundColor: 'primary.main',
            color: 'common.white',
            borderRadius: 6,
            border: `1px solid ${theme.palette.primary.light}`,
            marginTop: '6px',
            transition: 'transform 120ms ease, background-color 120ms ease',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              transform: 'translateY(-1px)',
              color: 'primary.main',
            },
            '&.Mui-disabled': { opacity: 0.45 },
          })}
        >
          <AddIcon fontSize="inherit" />
        </IconButton>
      </span>
    </Tooltip>
  );
}

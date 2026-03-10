
import { alpha, IconButton, Tooltip, useTheme } from '@mui/material';
import { tooltipStyle } from '../../styles/styles';

/**
 * A toolbar primitive that allows you to build an UI with multiple exclusive toggle groups, like the list type toggle.
 * @group Toolbar Primitives
 */
export const MUISingleChoiceToggleGroup = <T extends string>({
  value,
  onChange,
  items,
}: {
  items: {
    title: string;
    value: T;
    contents: React.ReactNode;
  }[];
  onChange: (value: T | '') => void;
  value: T | '';
}) => {
  const theme = useTheme();
  return (
    <div>
      {items.map((item, index) => {
        const on = item.value === value;
        return (
          <Tooltip title={item.title} {...tooltipStyle}>
            <IconButton
              sx={{
                borderRadius: on ? 1 : undefined,
                backgroundColor: on
                  ? alpha(theme.palette.primary.light, 0.2)
                  : undefined,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.light, 0.4), // custom hover color
                },
              }}
              size={'small'}
              onClick={() => onChange(on ? '': item.value)}
            >
              {item.contents}
            </IconButton>
          </Tooltip>
        );
      })}
    </div>
  );
};

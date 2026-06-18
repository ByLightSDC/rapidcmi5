import { Autocomplete, IconButton, TextField, Tooltip } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { tooltipStyle } from '../rapidcmi5_mdx/styles/styles';

const fontSizeLabel = '12px';

export default function AnySelector({
  id,
  children,
  theValue,
  disabled,
  hasNoOptions,
  noOptionsPlaceholder,
  optionsPlaceholder,
  iconButton = <AddBoxIcon color="inherit" />,
  iconButtonDisabled = false,
  iconButtonTooltip = 'Add',
  iconButtonHandler,
  topicLabel,
  styleProps = {},
  selectorStyleProps = { minWidth: '100px' },
  onChange,
}: {
  id?: string;
  topicLabel?: string;
  theValue?: string;
  children?: JSX.Element[] | null;
  disabled?: boolean;
  hasNoOptions?: boolean;
  noOptionsPlaceholder?: string;
  optionsPlaceholder?: string;
  iconButton?: JSX.Element;
  iconButtonDisabled?: boolean;
  iconButtonTooltip?: string;
  iconButtonHandler?: (event: any) => void;
  styleProps?: any;
  selectorStyleProps?: any;
  onChange?: (theSelection: string) => void;
}) {
  const options = children
    ? children.map((item) => ({
        value: item.props.value as string,
        label:
          typeof item.props.children === 'string'
            ? item.props.children
            : String(item.props.value ?? ''),
      }))
    : [];

  const selectedOption = options.find((opt) => opt.value === theValue) ?? undefined;

  return (
    <div style={{ display: 'flex', alignItems: 'center', ...styleProps }}>
      {children && (
        <Autocomplete
          id={id}
          options={options}
          value={selectedOption}
          disabled={disabled || hasNoOptions}
          disableClearable
          getOptionLabel={(opt) => opt.label}
          isOptionEqualToValue={(opt, val) => opt.value === val.value}
          onChange={(_, newVal) => {
            if (newVal && onChange) onChange(newVal.value);
          }}
          noOptionsText={noOptionsPlaceholder ?? 'No options'}
          data-testid={`${id}-selector`}
          sx={{
            ...selectorStyleProps,
            '& .MuiInputBase-root': {
              height: '36px',
              minHeight: 'unset',
              flexWrap: 'nowrap',
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={topicLabel}
              placeholder={!theValue ? optionsPlaceholder : undefined}
              size="small"
              sx={{ fontSize: fontSizeLabel }}
            />
          )}
        />
      )}

      {iconButtonHandler && (
        <IconButton
          disabled={iconButtonDisabled}
          color="inherit"
          onClick={iconButtonHandler}
        >
          <Tooltip arrow title={iconButtonTooltip} {...tooltipStyle}>
            {iconButton}
          </Tooltip>
        </IconButton>
      )}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';

/* MUI */
import MenuItem from '@mui/material/MenuItem';
import TextField, { StandardTextFieldProps } from '@mui/material/TextField';
import { ButtonInfoField } from '../buttons/buttons';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { TypographyProps } from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';

/* Icons */
import Checkbox from '@mui/material/Checkbox';
import { SelectProps, Stack } from '@mui/material';

export type SelectorMenuOption = {
  data?: any;
  disabled?: boolean;
  value?: string;
  label: string;
  icon?: JSX.Element | null;
  group?: string;
};

/**
 * @interface BrandedSelectorProps
 * @property {string} [id = 'selector'] Id
 * @property {string || string[]} [defaultValue = ''] Default selected value (use array if multiple select)
 * @property {*} [divProps] Props passed to div
 * @property {boolean} [isFormStyle = true] Whether component should look like form control fields
 * @property {boolean} [isFullWidth = true] Whether component should stretch to fit parent width
 * @property {string} [infoText] Helper text for field
 * @property {string} [label] Label to display above field
 * @property {SelectProps} [SelectProps] props to pass to Select component (e.g., multiple: true)
 * @property {string[] | SelectorMenuOption[]} [options] Menu Options
 * @property {SelectorMenuOption[]} [optionsAlt] Menu Options with icon
 * @property {boolean} [readOnly] Indication whether field is not editable
 * @property {boolean} [allowNoneOption=false] Include an empty entry at top of list
 * @property {*} [sxProps] sx props passed to MUI Selector
 * @property {*} [sxInputProps] sx props passed to internal input field
 * @property {(sel?: any) => void} [onSelect] Callback for option selected
 */
interface BrandedSelectorProps extends StandardTextFieldProps {
  icon?: JSX.Element;
  id?: string;
  defaultValue?: string | string[];
  disabledOptions?: string[];
  divProps?: any;
  errorMessage?: string;
  header?: JSX.Element;
  isFormStyle?: boolean;
  isFullWidth?: boolean;
  infoText?: string | JSX.Element | null;
  isTransient?: boolean;
  label?: string;
  listItemProps?: TypographyProps<'span', { component?: 'span' | undefined }>;
  SelectProps?: Partial<SelectProps>;
  readOnly?: boolean;
  required?: boolean;
  options?: string[];
  optionsAlt?: SelectorMenuOption[];
  allowNoneOption?: boolean;
  allowItemWrapping?: boolean;
  sxProps?: any;
  sxInputProps?: any;
  onSelect?: (sel?: any) => void;
}

/**
 * Displays selection menu
 * @param {BrandedSelectorProps} props
 * @return {JSX.Element} Branded React Component
 */
export function SelectorMainUi(props: BrandedSelectorProps) {
  const {
    defaultValue = '',
    disabledOptions,
    divProps = {},
    errorMessage,
    header,
    icon,
    id = 'selector',
    isFullWidth = true,
    isFormStyle = true,
    infoText = null,
    isTransient = false,
    label,
    listItemProps = {
      color: 'primary',
      fontSize: 'small',
      fontWeight: 'lighter',
      textTransform: 'none',
    },
    SelectProps = {},
    options,
    optionsAlt,
    readOnly = false,
    required = false,
    allowNoneOption = false,
    allowItemWrapping = false,
    sxProps = {},
    sxInputProps = {},
    onSelect,
    ...textFieldProps
  } = props;

  useEffect(() => {
    if (!isTransient) {
      setSelValue(defaultValue);
    }
  }, [defaultValue]);

  const [selValue, setSelValue] = useState(defaultValue);

  //#region to handle wrapping menu items
  const selectRef = useRef<HTMLDivElement | null>(null);
  const itemWrappingProps = useMemo(() => {
    if (allowItemWrapping) {
      return {
        MenuProps: {
          PaperProps: {
            sx: {
              whiteSpace: 'normal', // Allow wrapping in the dropdown
              maxWidth: selectRef.current
                ? `${selectRef?.current?.offsetWidth}px`
                : 'auto', // menu never wider than field            },
            },
          },
        },
      };
    }
    return {};
  }, [selectRef.current, allowItemWrapping]);
  //#endregion

  const multiple = SelectProps && SelectProps.multiple === true;
  // Make sure that a multiple select value is an array
  // (solves a filter redux issue - where it used to be a single select filter)
  const displayValue =
    multiple && typeof selValue === 'string' ? [selValue] : selValue;

  // for multi-select display first selection and indication of additional ones
  const getFieldDisplayValue = (value: any) => {
    if (Array.isArray(value) && value.length > 0) {
      const additionalCount = value.length - 1;
      let firstValue = value[0];
      options?.forEach((option: any) => {
        if (option?.label && option?.value === value[0]) {
          firstValue = option.label;
        }
      });
      if (additionalCount > 0) {
        return [firstValue, ` + ${additionalCount} more`];
      } else {
        return [firstValue];
      }
    }
    return value;
  };

  const theList = options || optionsAlt;
  return (
    <div className="content-row" style={{ ...divProps }}>
      {!selValue ? icon : null}
      {theList && (
        <TextField
          error={errorMessage ? true : false}
          helperText={errorMessage}
          select
          fullWidth={isFullWidth}
          size="small"
          id={id}
          data-testid={id}
          name={id}
          aria-label={label}
          disabled={readOnly}
          label={label}
          value={options ? displayValue : selValue}
          onChange={(event: any) => {
            if (!isTransient) {
              setSelValue(event.target.value);
            }
            if (onSelect) {
              onSelect(event.target.value);
            }
          }}
          InputLabelProps={{ shrink: true }}
          //disableUnderline: true,
          InputProps={{ ...sxInputProps }}
          sx={{
            margin: '4px',
            backgroundColor: (theme: any) =>
              props.disabled
                ? `${theme.input.disabledFill}`
                : `${theme.input.fill}`,
            ...sxProps,
            '& .MuiOutlinedInput-root': {
              width: 'inherit',
              height: 'inherit',
            },
          }}
          ref={selectRef}
          SelectProps={{
            ...itemWrappingProps,
            ...SelectProps,
            renderValue: getFieldDisplayValue,
          }}
          {...textFieldProps}
        >
          {allowNoneOption && (
            // minHeight is so that the "empty" value has same height as other(s)
            <MenuItem
              key={''}
              value={''}
              style={{ minHeight: '24px' }}
            ></MenuItem>
          )}
          {header}
          {theList.map((option: any, index) => {
            // handle label/value vs simple string option
            const label = option.label ? option.label : option;
            const value = option.value ? option.value : label;
            const selected = multiple
              ? selValue.indexOf(value) > -1
              : selValue === value;
            return (
              <MenuItem
                disabled={
                  option.disabled ||
                  (disabledOptions ? disabledOptions.includes(label) : false)
                }
                key={value}
                value={value}
                dense={true}
                style={
                  allowItemWrapping
                    ? {
                        whiteSpace: 'normal', // Allow wrapping
                        wordWrap: 'break-word',
                        alignItems: 'flex-start', // Align multiline text nicely
                        maxWidth: '100%',
                      }
                    : {}
                }
                selected={selected}
                //REFdisableGutters={true}
              >
                {multiple && (
                  <Checkbox
                    size="small"
                    sx={{ paddingTop: '0px', paddingBottom: '0px' }}
                    checked={selected}
                  />
                )}
                {option.icon && (
                  <ListItemIcon //marginRight between icon and option text
                    sx={{
                      padding: '0px',
                      margin: '0px',
                      marginRight: '2px',
                      minWidth: '0px',
                    }}
                  >
                    {option.icon}
                  </ListItemIcon>
                )}
                {isFormStyle && label}
                {!isFormStyle && (
                  <ListItemText
                    sx={{ padding: '0px', margin: '0px' }}
                    primary={label}
                    primaryTypographyProps={listItemProps}
                  />
                )}
              </MenuItem>
            );
          })}
        </TextField>
      )}
      {infoText && <ButtonInfoField message={infoText} />}
    </div>
  );
}

/**
 * @typedef {Object} autocompleteProps
 * @property {boolean} [multiple] Whether to allow multiple selection
 * @property {boolean} [freeSolo] Whether to allow entry of value other than combobox
 * @property {JSX.Element} [clearIcon] override clear icon X
 * @property {boolean} [disableClearable] Whether to disable the clear button (X)
 * @property {(option: any) => string} [groupBy] Function to call if providing options as "grouped objects"
 *            example: [{label: 'firstOption', group: 'One'},
 *                      {label: 'secondOption', group: 'One'},
 *                      {label: 'anotherOption'}, group: 'Two'}]
 */
type autocompleteProps = {
  multiple?: boolean;
  freeSolo?: boolean;
  clearIcon?: JSX.Element;
  disableClearable?: boolean;
  groupBy?: (option: any) => string;
};

/**
 * @interface BrandedComboSelectorProps
 * @property {autocompleteProps} [autocompleteProps] Optional props for autocomplete
 * @property {string} [defaultValue = ''] Default selected value
 * @property {string[]} [disabledOptions] List of option(s) which should be disabled
 * @property {*} [divProps] Props passed to div
 * @property {boolean} [error] Whether field has error or not
 * @property {string} [infoText] Helper text for field
 * @property {boolean} [isFullWidth = true] Whether component should stretch to fit parent width
 * @property {Array<any>} options List of options -- normally a list of strings
 *     when grouping options - the item should include a label field which will be displayed
 * @property {boolean} [readOnly=false] Indication whether field is not editable
 * @property {boolean} [required=false] Indication whether field is required
 * @property {boolean} [showAllOptions=true] Whether to show all options regardless of what is typed
 * @property {*} [sxProps] sx props passed to MUI Autocomplete field
 * @property {*} [sxInputProps] sx props passed to internal input field
 * @property {(sel?: any) => void} [onSelect] Callback for option selected (or entered if freeSolo)
 */
interface BrandedComboSelectorProps extends StandardTextFieldProps {
  autocompleteProps?: autocompleteProps;
  defaultValue?: string;
  disabledOptions?: string[];
  disabledOptionMethod?: (option: SelectorMenuOption) => boolean;
  divProps?: any;
  error?: boolean;
  infoText?: string;
  isFullWidth?: boolean;
  options: Array<any>;
  readOnly?: boolean;
  required?: boolean;
  showAllOptions?: boolean;
  sxProps?: any;
  sxInputProps?: any;
  groupTextFieldProps?: StandardTextFieldProps;
  textFieldProps?: StandardTextFieldProps;
  onSelect?: (sel?: any) => void;
}
/**
 * Displays combo box selector
 * @param {BrandedComboSelectorProps} props
 * @return {JSX.Element} Branded React Component
 */
export function ComboBoxSelectorUi(props: BrandedComboSelectorProps) {
  const {
    autocompleteProps = {},
    defaultValue = '',
    disabledOptions,
    disabledOptionMethod,
    divProps = {},
    error,
    helperText,
    id,
    infoText,
    isFullWidth = true,
    label = '',
    options,
    readOnly = false,
    required = false,
    showAllOptions = true,
    sxProps = {},
    groupTextFieldProps,
    textFieldProps,
    onSelect,
  } = props;

  const [comboValue, setComboValue] = useState(defaultValue);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  /**
   * Update the selected value when the default value changes.
   */
  useEffect(() => {
    setComboValue(defaultValue);
    setInputValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    //
  }, [options]);

  /**
   * filter options as you type if freeSolo-ing
   */
  let filterOptionProps = {};
  if (autocompleteProps.freeSolo && showAllOptions === true) {
    filterOptionProps = { filterOptions: (options: any) => options };
  }

  return (
    <div
      className="content-row"
      style={{ ...divProps }}
      onKeyDown={(e) => {
        if (e.code === 'Enter') {
          // prevent enter from causing submit of form...
          e.preventDefault();
          // store in dropdown list
          if (autocompleteProps.freeSolo && onSelect) {
            onSelect(inputValue);
          }
          // close the dropdown
          setDropdownOpen(false);
        }
      }}
    >
      {!readOnly ? (
        <Autocomplete
          id={'combo-box-' + id}
          data-testid={'combo-box-' + id}
          inputValue={inputValue}
          open={isDropdownOpen}
          value={comboValue}
          options={options}
          disabled={readOnly}
          fullWidth={isFullWidth}
          {...autocompleteProps}
          {...filterOptionProps}
          sx={{
            display: 'flex',
            flexGrow: 1,
            marginTop: '-4px',
            fontSize: '14px',
            ...sxProps,
          }}
          getOptionDisabled={(option) => {
            if (disabledOptions) {
              if (disabledOptionMethod) {
                return disabledOptionMethod(option);
              }
              return disabledOptions.indexOf(option) >= 0;
            } else {
              return false;
            }
          }}
          getOptionLabel={(option) => {
            if (autocompleteProps?.groupBy) {
              return option?.label || '';
            }
            //Autocomplete uses null for an empty value - so need the label to be ''
            return option ? option : '';
          }}
          isOptionEqualToValue={(option, value) => {
            return option === value;
          }}
          onChange={(event: any, newValue: any) => {
            //user clicked option
            // if field is cleared Autocomplete sends back null so set as empty
            setInputValue(newValue || '');
            setComboValue(newValue || '');
            // handle selected entry
            if (onSelect) {
              onSelect(newValue || '');
            }
          }}
          onInputChange={(event, newInputValue) => {
            //user typed
            setInputValue(newInputValue);
            if (autocompleteProps.freeSolo) {
              setComboValue(newInputValue);
            }
          }}
          onOpen={() => setDropdownOpen(true)}
          onClose={(event, reason) => {
            setDropdownOpen(false);
            // handle typed in entry
            if (onSelect && reason === 'blur') {
              onSelect(comboValue);
            }
          }}
          renderInput={(params) => (
            <TextField
              autoComplete="off"
              {...params}
              sx={{
                fontSize: '14px',
                borderRadius: '4px',
                backgroundColor: (theme: any) => `${theme.input.fill}`, //combo box interior color
              }}
              InputLabelProps={{ shrink: true }} // always put label above box even if empty
              label={label}
              margin="dense"
              name={id}
              variant="outlined"
              disabled={readOnly}
              required={required}
              error={error}
              helperText={helperText}
              size="small"
            />
          )}
          slotProps={{
            popper: {
              sx: {
                '& .MuiAutocomplete-groupLabel': {
                  lineHeight: 1,
                  ...groupTextFieldProps,
                },
                '& .MuiAutocomplete-option': {
                  lineHeight: 1,
                  ...textFieldProps,
                },
              },
            },
          }}
        />
      ) : (
        <TextField
          name={id}
          label={label}
          defaultValue={defaultValue}
          disabled={true}
          fullWidth={isFullWidth}
          InputLabelProps={{ shrink: true }}
          InputProps={{ disableUnderline: true }}
          margin="dense"
          required={required}
          size="small"
          variant="standard"
        />
      )}
      {infoText && <ButtonInfoField message={infoText} />}
    </div>
  );
}

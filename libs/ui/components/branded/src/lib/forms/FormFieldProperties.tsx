import { useState } from 'react';

/* Form */
import FormControlSelectField from './FormControlSelectField';
import FormControlTextField from './FormControlTextField';
import {
  ButtonInfoFormHeaderLayout,
  ButtonInfoField,
} from '../inputs/buttons/buttons';

import { inputFilterType } from '../navigation/paging/PaginationFiltersContext';

/* MUI */
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

/* Icons */
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { UseFormReturn } from 'react-hook-form';

/** @constant
 * Properties that should appear first, above the remaining properties
 * FUTURE - this can be overridden
 *  @type {object}
 */
const highPriorityProperties = {
  username: 'string',
  password: 'string',
};

/** @constant
 * Default Properties
 * FUTURE - this can be overridden
 *  @type {object}
 */
const defaultProperties = {
  domain: 'string',
};

/**
 * @typedef {((props: tPropertyFieldProps) => JSX.Element))} [renderItem]
 * @property {string} fieldName Field Name for group o properties
 * @property {boolean} [defaultIsExpanded] Whether properties are expanded and visible
 * @property {any} defaultValues Default property values for POST
 * @property {any}  errors Form errors
 * @property {any} [expandTestId] Test id for expand interactable
 * @property {UseFormReturn} formMethods React hook form methods
 * @property {string} [infoTextTitle] Info button text
 * @property {boolean} [isExpandable] Whether properties are expandable
 * @property {boolean} [isModal] Whether form is in a modal state
 * @property {object} [placeholder] Placeholder text for property fields
 * @property {boolean} [readOnly] Whether form is in readonly state
 * @property {string} [title] Title
 * @property {string} [width]
 */
type tFormFieldPropertiesProps = {
  renderItem?: (props: tPropertyFieldProps) => JSX.Element;
  fieldName: string;
  defaultIsExpanded?: boolean;
  defaultValues: any;
  errors: any;
  expandTestId?: string;
  formMethods: UseFormReturn;
  infoTextTitle?: string | null;
  isExpandable?: boolean;
  isModal?: boolean;
  priorityProperties?: { [key: string]: string };
  properties?: { [key: string]: string };
  config?: { [key: string]: inputFilterType };
  readOnly?: boolean;
  title?: string;
  width?: string;
};

/**
 * @interface tPropertyFieldProps
 * @prop {string} fieldName Field name for individual property
 * @prop {any} fieldErrors React hook form error(s) for array row entry (from tFormFieldRendererProps)
 * @prop {string} fieldType Field type for individual property
 * @prop {UseFormReturn} formMethods React hook form methods
 * @prop {boolean} isModal (optional) Indication of form being displayed as modal (default=false) (from tFormFieldRendererProps)
 * @prop {string} placeholder Placeholder text for selection
 * @prop {boolean} readOnly Indication that field is (not) editable (from tFormFieldRendererProps)
 **/
type tPropertyFieldProps = {
  fieldConfig?: inputFilterType | undefined;
  fieldName: string;
  fieldErrors: any;
  fieldLabel: string;
  fieldType: string;
  formMethods: UseFormReturn;
  key: string;
  placeholder: string;
  readOnly: boolean;
  isModal?: boolean;
};

/**
 * Displays Nested Form Field Properties
 * @param {tFormFieldPropertiesProps} props Component Props
 * @return {JSX.Element} React Component
 */
export function FormFieldProperties({
  fieldName,
  renderItem = DefaultRenderItem,
  errors,
  isModal = false,
  readOnly = false,
  defaultIsExpanded = true,
  defaultValues,
  expandTestId = 'properties-expand',
  formMethods,
  infoTextTitle = null,
  isExpandable = false,
  priorityProperties = highPriorityProperties,
  properties = defaultProperties,
  config = {},
  title = '',
  width = '100%',
}: tFormFieldPropertiesProps) {
  const [isExpanded, setIsExpanded] = useState(defaultIsExpanded);
  const iconTransform = isExpanded ? 'rotate(180deg)' : 'rotate(90deg)';
  const fieldErrors =
    errors && errors.hasOwnProperty(fieldName) ? errors[fieldName] : null;

  let highPriorityKeys = Object.keys(priorityProperties);
  let lowPriorityKeys = Object.keys(properties);

  /**
   * Toggles expanded state
   */
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section role="list" style={{ width }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          alignItems: 'center',
        }}
      >
        <div>
          <div className="content-row-icons">
            {isExpandable && (
              <ListItemIcon data-testid={expandTestId} onClick={toggleExpanded}>
                <ExpandLessIcon
                  color="primary"
                  sx={{ transform: iconTransform }}
                />
              </ListItemIcon>
            )}
            <Typography variant="h5" sx={{ paddingRight: '4px' }}>
              {title + '  '}
            </Typography>
            {infoTextTitle && (
              <ButtonInfoField
                message={infoTextTitle}
                props={{ sx: ButtonInfoFormHeaderLayout }}
              />
            )}
          </div>
        </div>
      </Box>
      {isExpanded && (
        <>
          <Grid container spacing={2}>
            {highPriorityKeys.map((key: string) => {
              const fieldConfig = config.hasOwnProperty(key)
                ? config[key]
                : undefined;

              return renderItem({
                formMethods,
                fieldConfig: fieldConfig,
                fieldName: `${fieldName}.${key}`,
                fieldErrors: fieldErrors ? fieldErrors[key] : null,
                fieldLabel: key,
                fieldType: priorityProperties[key],
                key: key,
                placeholder: '',
                readOnly,
              });
            })}

            {lowPriorityKeys.map((key) => {
              const fieldConfig = config.hasOwnProperty(key)
                ? config[key]
                : undefined;
              return renderItem({
                formMethods,
                fieldConfig: fieldConfig,
                fieldName: `${fieldName}.${key}`,
                fieldErrors: fieldErrors ? fieldErrors[key] : null,
                fieldLabel: fieldConfig?.label || key,
                fieldType: properties[key],
                key: key,
                placeholder: '',
                readOnly,
              });
            })}
          </Grid>
        </>
      )}
    </section>
  );
}
/**
 * Renders a Properties Field
 * @param {tFormFieldPropertiesProps} props Property's Render Props
 * @return {JSX.Element} React Component
 */
function DefaultRenderItem(props: tPropertyFieldProps) {
  const {
    fieldConfig,
    fieldName,
    fieldErrors,
    fieldLabel,
    fieldType,
    formMethods,
    key,
    placeholder,
    readOnly,
  } = props;
  const { control } = formMethods;

  let gridSize = 12;
  switch (fieldType) {
    case 'bool':
    case 'number':
      gridSize = 3;
      break;
    case 'stringOption':
      gridSize = 4;
      break;
    default:
      break;
  }

  if (!fieldConfig || !fieldConfig.options) {
    return (
      <Grid key={key} item xs={gridSize}>
        <FormControlTextField
          control={control}
          label={fieldLabel}
          // error={fieldErrors ? Boolean(fieldErrors) : false}
          error={false}
          helperText={fieldErrors?.message}
          name={fieldName}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      </Grid>
    );
  }

  return (
    <Grid key={key} item xs={gridSize}>
      <FormControlSelectField
        control={control}
        error={false}
        helperText={fieldErrors?.message}
        name={fieldName}
        label={fieldConfig.label}
        readOnly={readOnly}
        sxProps={{ width: '100%' }}
      >
        {fieldConfig.options.map((option: any) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </FormControlSelectField>
    </Grid>
  );
}

export default FormFieldProperties;

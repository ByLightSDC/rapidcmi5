import { useEffect } from 'react';

/* MUI */
import Grid from '@mui/material/Grid';

import { useDisplayFocus } from '../hooks/useDisplayFocus';

import { tFormFieldRendererProps } from './FormFieldArray';
import FormControlTextField from './FormControlTextField';

/**
 * @interface fieldGroupProps
 * @extends tFormFieldRendererProps
 * @property {number} [nameGridWidth] Override grid width for name field
 * @property {number} [valueGridWitdh] Override grid width for value field
 */
interface fieldGroupProps extends tFormFieldRendererProps {
  nameGridWidth?: number;
  valueGridWidth?: number;
}

const defaultNameGridWidth = 4;
const defaultValueGridWidth = 4;

/**
 * KeyValueField component encapsulates an entry that is a key / string value pair
 * for use in an array (see FormFieldArray component)
 * @param {fieldGroupProps} props
 * @returns {React.ReactElement}
 */
export function KeyValueField(props: fieldGroupProps) {
  const {
    formMethods,
    indexedArrayField,
    indexedErrors,
    isFocused,
    readOnly,
    nameGridWidth = defaultNameGridWidth,
    valueGridWidth = defaultValueGridWidth,
  } = props;
  const { control } = formMethods;

  const focusHelper = useDisplayFocus();
  // this effect is for focusing on key(name) field when added as row to the array
  useEffect(() => {
    if (isFocused) {
      focusHelper.focusOnElementById(`${indexedArrayField}.name`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);
  return (
    <>
      <Grid item xs={nameGridWidth}>
        <FormControlTextField
          control={control}
          error={Boolean(indexedErrors?.name)}
          helperText={indexedErrors?.name?.message}
          name={`${indexedArrayField}.name`}
          required
          label="Name"
          readOnly={readOnly}
        />
      </Grid>
      <Grid item xs={0.1} />
      <Grid item xs={valueGridWidth}>
        <FormControlTextField
          control={control}
          error={Boolean(indexedErrors?.value)}
          helperText={indexedErrors?.value?.message}
          name={`${indexedArrayField}.value`}
          required
          label="Value"
          readOnly={readOnly}
        />
      </Grid>
    </>
  );
}
export default KeyValueField;

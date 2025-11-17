import { useContext, useEffect } from 'react';

/* Branded */
import {
  FormControlTextField,
  FormControlUIContext,
  FormFieldArray,
  tFormFieldRendererProps,
  useDisplayFocus,
  ViewExpander,
} from '@rangeos-nx/ui/branded';

/** MUI */
import Grid from '@mui/material/Grid';

/** Constants */
// field under metadata which will house any metadata that the rangeOs UI can manipulate
export const metadataRangeOsUIField = 'rangeOsUI';

/**
 * @typedef tFieldProps
 * @property {boolean} readOnly Whether field should be readOnly or editable
 */
type tFieldProps = {
  readOnly: boolean;
};

/**
 * JSON Metadata Field for use on form(s)
 * @param {tFieldProps} props Component properties
 * @return {JSX.Element} React Component
 * NOTE: To validate this field in form use metadata: METADATA_GROUP() from validation
 */
export function MetadataField(props: tFieldProps) {
  const { readOnly } = props;
  const { formMethods } = useContext(FormControlUIContext);
  const { formState, getValues, setValue, trigger, watch } = formMethods;
  const { errors } = formState;

  const watchTags = watch(`metadata.${metadataRangeOsUIField}.tags`);
  /**
   * Use Effect to handle when a tag gets deleted so we clear the tagValue as well
   * BE currently uses an older mikroorm version which does not accept tags array
   * so we need to convert the tags array into a json object
   */
  useEffect(() => {
    const tagValues = getValues(`metadata.${metadataRangeOsUIField}.tagValues`);

    if (
      watchTags &&
      tagValues &&
      Object.keys(tagValues).length > watchTags.length
    ) {
      const keys = Object.keys(tagValues);
      keys.forEach((key) => {
        if (!watchTags.includes[key]) {
          delete tagValues[key];
        }
      });
      setValue(`metadata.${metadataRangeOsUIField}.tagValues`, tagValues);
    }
  }, [watchTags?.length]);

  /**
   * Handles setting of tag and associated tagValue for filtering
   * BE currently uses an older mikroorm version which does not accept tags array
   * so we need to convert the tags array into a json object
   * @param {string} newValue Tag entered
   * @param {string} indexedArrayField form field identifier
   * @param {number} rowIndex Index into tag array
   */
  const handleTagChange = (
    newValue: string,
    indexedArrayField: string,
    rowIndex?: number,
  ) => {
    // maintain list of tagValues for filtering -- remove old tag / add new one
    const oldTag = getValues(indexedArrayField);
    const tagValues =
      getValues(`metadata.${metadataRangeOsUIField}.tagValues`) || {};
    if (tagValues && oldTag) {
      let deleteTag = true;
      if (rowIndex) {
        // make sure this tag name isn't in another place in array (e.g., duplicate)
        watchTags.forEach((tag: string, index: number) => {
          if (tag === oldTag && index !== rowIndex) {
            deleteTag = false;
          }
        });
      }
      if (deleteTag && tagValues.hasOwnProperty(oldTag))
        delete tagValues[oldTag];
    }
    if (newValue !== '') {
      tagValues[newValue] = 0;
    }
    setValue(`metadata.${metadataRangeOsUIField}.tagValues`, tagValues);

    setValue(indexedArrayField, newValue);
    // need to trigger higher to catch duplicates
    trigger('metadata');
  };

  return (
    <ViewExpander
      defaultIsExpanded={false}
      title="Metadata"
      expandTestId="metadata-expand"
    >
      <Grid item xs={8}>
        <FormFieldArray
          errors={errors?.metadata?.[metadataRangeOsUIField]}
          formMethods={formMethods}
          arrayFieldName={`metadata.${metadataRangeOsUIField}.tags`}
          arrayRenderItem={(props: tFormFieldRendererProps) => {
            return (
              <MetadataRenderItem
                {...props}
                handleTagChange={handleTagChange}
              />
            );
          }}
          defaultValues={''}
          title="Tags"
          readOnly={readOnly}
        />
      </Grid>
    </ViewExpander>
  );
}

/**
 * @interface fieldProps
 * @extends tFormFieldRendererProps
 * @property {(newValue: string,indexedArrayField: string,rowIndex?: number)=> void} handleTagChange Method to process the tag field change
 */
interface fieldProps extends tFormFieldRendererProps {
  handleTagChange: (
    newValue: string,
    indexedArrayField: string,
    rowIndex?: number,
  ) => void;
}

/**
 * Range MetadataRenderItem Field
 * Handles render and focus of metadata field
 * @param {fieldProps} props Array field props
 */
function MetadataRenderItem(props: fieldProps) {
  const {
    formMethods,
    indexedArrayField,
    indexedErrors,
    isFocused,
    label = '',
    placeholder,
    readOnly,
    rowIndex,
    handleTagChange,
  } = props;
  const { control } = formMethods;

  const focusHelper = useDisplayFocus();
  // this effect is for focusing on tag field when added as row to array
  useEffect(() => {
    if (isFocused) {
      focusHelper.focusOnElementById(indexedArrayField);
    }
  }, [isFocused]);

  return (
    <FormControlTextField
      control={control}
      label={label}
      error={Boolean(indexedErrors)}
      helperText={indexedErrors?.message}
      name={indexedArrayField}
      placeholder={placeholder}
      required
      readOnly={readOnly}
      onChange={(newValue) => {
        handleTagChange(newValue, indexedArrayField, rowIndex);
      }}
    />
  );
}
export default MetadataField;

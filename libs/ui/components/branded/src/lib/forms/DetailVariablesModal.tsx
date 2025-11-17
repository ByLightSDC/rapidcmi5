/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from 'react';

/* Branded */
import {
  ButtonModalMainUi,
  ButtonModalMinorUi,
  DynamicPropertyContext,
  DynamicSchema,
  FormControlUIContext,
  FormCrudType,
  LooseObject,
  ModalDialog,
} from '@rangeos-nx/ui/branded';

/* MUI */
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

/* Icons */
import Check from '@mui/icons-material/Check';

export const mustEnterVariablesError = 'Variables are required for this item!';
/**
 * @typedef {object} tModalProps
 * @property {string} detailName Current name of item for this array detail
 * @property {string} [displayVariablesField='displayVariables'] top-level dynamic UI schema field to be used by modal. values are copied to detailVariablesField on close of modal
 * @property {FormCrudType} crudType Current mode of form
 * @property {*} [formErrors] Top level form errors
 * @property {string} indexedArrayField Form field of current item Details
 * @property {boolean} isOpen Whether modal should be displayed
 * @property {boolean} isValid React Hook Form State field
 * @property {*} schema variables schema for this array detail
 * @property {(apply?: boolean) => void} onClose Method to call when closing (without applying changes)
 */
type tModalProps = {
  detailName?: string;
  detailVariablesField: string;
  displayVariablesField?: string;
  crudType: FormCrudType;
  formErrors?: any;
  indexedArrayField: string;
  isValid?: boolean;
  isOpen: boolean;
  schema: any;
  onClose: (apply?: boolean) => void;
};

/**
 * Handles editing of detail variables based on associated Details (example Ansible Role Variables / Traffic Variables)
 * NOTE: need to have
 *  #1 a top-level field in the "form data" to track the schema while making the edits
 *     it should be called something like displayVariables and have validation on it as
 *       displayVariables: getSingleYupValidationSchema()
 *     the name needs to be passed to DetailVariablesField for use by it and this component if different
 *  #2 within the details array element, there needs to be a field to keep track of errors for the variables
 *     it should be called variablesDisplayError and have validation within the details array as
 *       variablesDisplayError: yup
 *            .string()
 *             .nullable()
 *            .max(0, mustEnterVariablesError),
 * @param {tModalProps} props Modal Props from parent form
 * @returns {React.ReactElement}
 */
export function DetailVariablesModal(props: tModalProps) {
  const {
    detailName,
    detailVariablesField,
    displayVariablesField = 'displayVariables',
    crudType,
    formErrors,
    indexedArrayField,
    isValid = false,
    isOpen,
    schema,
    onClose,
  } = props;

  const { formMethods } = useContext(FormControlUIContext);
  const { getValues, setValue } = formMethods;
  const { resetSingleYupValidationSchema } = useContext(DynamicPropertyContext);

  const propertiesExist =
    schema && schema.properties && Object.keys(schema.properties).length > 0;

  const handleClose = () => {
    const initialDisplayError = getValues(
      `${indexedArrayField}.variablesDisplayError`,
    );
    const currentVariableErrors = formErrors
      ? formErrors[`${displayVariablesField}`]
      : undefined;

    let variablesDisplayError = initialDisplayError;

    // only set the display error on cancel if "first time" coming here after add
    if (
      currentVariableErrors &&
      initialDisplayError === mustEnterVariablesError
    ) {
      const errorKeys = Object.keys(currentVariableErrors) as Array<string>;
      const errorValues = Object.values(currentVariableErrors) as Array<any>;
      variablesDisplayError =
        'Variables contain errors.\n' +
        errorKeys[0] +
        ': ' +
        errorValues[0].message +
        (errorKeys.length > 1
          ? ' and ' + (errorKeys.length - 1) + ' more...'
          : '');
    }

    setValue(
      `${indexedArrayField}.variablesDisplayError`,
      variablesDisplayError,
    );
    resetSingleYupValidationSchema();
    setValue(displayVariablesField, {});
    onClose();
  };

  const handleApply = () => {
    resetSingleYupValidationSchema();
    // clear array entry display error - can only apply when no errors
    setValue(`${indexedArrayField}.variablesDisplayError`, undefined);
    // set optional fields to undefined if null or empty string
    const variables = getValues(displayVariablesField);

    for (const [key, value] of Object.entries(variables)) {
      if (value === null || (typeof value === 'string' && value === '')) {
        variables[key] = undefined;
      }
    }
    setValue(`${indexedArrayField}.${detailVariablesField}`, variables);
    setValue(displayVariablesField, {});
    onClose(true); // apply
  };
  const titlePrefix =
    (crudType === FormCrudType.view ? 'View ' : 'Edit ') + 'Variables ';

  return (
    <div data-testid="detail-variables-modal">
      <ModalDialog
        shouldBlockInteraction={false} // need mouse click/up/down to propagate so we can handle the timepicker poppers
        buttons={[]}
        dialogProps={{
          open: isOpen,
        }}
        maxWidth="md"
      >
        <Box
          sx={{
            padding: '16px 0px 16px 8px', // top right bottom left
            display: 'flex',
            flexDirection: 'column',
            width: '700px',
            maxHeight: '100%', // so form will be correct height for scrolling when necessary
            overflow: 'hidden', // so only form will have scrollbar
          }}
        >
          {/* title area */}
          <Grid container spacing={2} sx={{ paddingTop: '8px' }}>
            <Grid item xs={11} sx={{ marginBottom: '12px' }}>
              <div className="content-row-icons">
                <Typography
                  color="text.primary"
                  className="clipped-text"
                  variant="h4"
                  sx={{ marginLeft: '16px' }}
                >
                  {titlePrefix}
                  <em>({detailName})</em>
                </Typography>
              </div>
            </Grid>
          </Grid>

          <div
            className="form-fields-container"
            style={{
              height: 'auto',
              minHeight: '120px',
            }}
          >
            <Grid container spacing={2} sx={{ paddingTop: '8px' }}>
              <Grid item xs={12}>
                <DynamicSchema
                  schemaData={schema}
                  crudType={crudType}
                  handleAsSingleYupValidation={true}
                  errors={
                    formErrors
                      ? formErrors[`${displayVariablesField}`]
                      : undefined
                  }
                  isModal={true}
                  isValid={isValid}
                  valuesFieldName={displayVariablesField}
                />
              </Grid>
              <Grid item xs={12} /> {/* spacer */}
            </Grid>
          </div>

          {/* form buttons area */}
          <Grid container columns={1} direction="column" wrap="nowrap">
            {/* paddingRight to line up with dynamic schema fields better */}
            <Grid
              item
              xs={12}
              sx={{ padding: '0px', margin: '0px', paddingRight: '16px' }}
            >
              <Box id="button-container-right">
                {crudType !== FormCrudType.view && propertiesExist ? (
                  <>
                    <ButtonModalMinorUi
                      id="cancel-button"
                      onClick={handleClose}
                    >
                      Cancel
                    </ButtonModalMinorUi>
                    <ButtonModalMainUi
                      id="apply-button"
                      startIcon={<Check />}
                      type="button"
                      onClick={handleApply}
                      disabled={Boolean(
                        formErrors && formErrors[`${displayVariablesField}`],
                      )}
                    >
                      Apply
                    </ButtonModalMainUi>
                  </>
                ) : (
                  <ButtonModalMainUi
                    id="close-button"
                    startIcon={null}
                    type="button"
                    onClick={handleClose}
                  >
                    Close
                  </ButtonModalMainUi>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </ModalDialog>
    </div>
  );
}

/**
 * Checks if given schema has any (required) properties
 * @param {any} schema Ansible Role schema to check
 * @param {boolean} [checkRequired=false] Whether to check specifically for required fields in the schema
 * @returns Indication of whether (required) properties were found
 */
export const checkForDetailProperties = (
  schema: any,
  checkRequired = false,
) => {
  const recurseCheckForRequired = (schemaData: LooseObject) => {
    if (
      schemaData.hasOwnProperty('required') &&
      Object.keys(schemaData['required']).length > 0
    ) {
      return true;
    }
    if (
      schemaData.hasOwnProperty('properties') &&
      Object.keys(schemaData['properties']).length > 0
    ) {
      for (const [key, value] of Object.entries(schemaData['properties'])) {
        const property = value as LooseObject;
        if (property.hasOwnProperty('type') && property['type'] === 'object') {
          if (recurseCheckForRequired(property)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const propertiesExist =
    schema && schema.properties && Object.keys(schema.properties).length > 0;

  if (propertiesExist && checkRequired) {
    // check recursively thru properties
    return recurseCheckForRequired(schema);
  }
  return propertiesExist;
};

export default DetailVariablesModal;

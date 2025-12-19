import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';
import { resetPersistance } from './utils/store';

/**
 * @interface FieldAttributes List of properties passed to FormField Components. Ex. readOnly
 * @property Example:  {"field1": {"readOnly": true}, "field2": {"required": true, "readOnly": false}}
 */
export interface FieldAttributes {
  [key: string]: { [key: string]: any };
}

/**
 * @typedef tDynamicSchemaState The type of data for this slice
 * @property {FieldAttributes} fieldAttributes List of current properties
 * @property {boolean} isValidationSetUp Current state of yup validation set up
 */
type tDynamicSchemaState = {
  fieldAttributes: FieldAttributes;
  isValidationSetUp: boolean;
};

interface State {
  schemaData: tDynamicSchemaState;
}

/**
 * @typedef tFieldPropVal Props for Get/SetFieldAttribute
 * @property {string} fieldName Schema data form field name (with . notation)
 * @property {string} attribute Attribute to get for field
 * @property {*} [value] Value to assign the attribute - used for Set function
 */
type tFieldPropVal = {
  fieldName: string;
  attribute: string;
  value?: any;
};

export const initialState: tDynamicSchemaState = {
  fieldAttributes: {},
  isValidationSetUp: false,
};

/**
 * Slice to manage dynamic schema data field attributes and validation
 * @see DynamicSchema component
 */
export const dynamicSchemaSlice : Slice = createSlice({
  name: 'schemaData',
  initialState,
  extraReducers: (builder) =>
    builder.addCase(resetPersistance, () => {
      return { ...initialState };
    }),
  reducers: {
    resetValidation: (state) => {
      state = initialState;
    },
    setAttribute: (state, action: PayloadAction<tFieldPropVal>) => {
      let attributes = state.fieldAttributes.hasOwnProperty(
        action.payload.fieldName,
      )
        ? { ...state.fieldAttributes[action.payload.fieldName] }
        : {};
      attributes[action.payload.attribute] = action.payload.value;
      state.fieldAttributes[action.payload.fieldName] = attributes;
    },
    setIsYupValidationSetUp: (
      state,
      action: PayloadAction<tDynamicSchemaState['isValidationSetUp']>,
    ) => {
      state.isValidationSetUp = action.payload;
    },
  },
});

//** Export actions to dispatch from components */
export const { resetValidation, setAttribute, setIsYupValidationSetUp } =
  dynamicSchemaSlice.actions;

/**
 * Selector to return the current set of fieldAttributes defined
 * To use
 *   import fieldAttributes from '@rapid-cmi5/ui/branded'
 *   const fieldAttributeSet = useSelector(fieldAttributes);
 * @param {RootState} state the redux state (useSelector handles this)
 * @returns {FieldAttributes}
 */
export const fieldAttributes = (state: State) =>
  state.schemaData.fieldAttributes;

/**
 * Selector to return the current validation status of schema data fields
 * To use
 *   import isYupValidationSetUp from '@rapid-cmi5/ui/branded'
 *   const isValidationSetUp = useSelector(isYupValidationSetUp);
 * @param {RootState} state the redux state (useSelector handles this)
 * @returns {boolean}
 */
export const isYupValidationSetUp = (state: State) =>
  state.schemaData.isValidationSetUp;

export const dynamicSchemaReducer = dynamicSchemaSlice.reducer;

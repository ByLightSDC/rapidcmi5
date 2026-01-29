/* Branded */

// TODO 
// pass in the form through the UI
export const ElementElementTypeEnum = {
    Category: 'category',
    CompetencyArea: 'competency_area',
    Knowledge: 'knowledge',
    OpmCode: 'opm_code',
    Skill: 'skill',
    Sort: 'sort',
    Task: 'task',
    WorkRole: 'work_role'
} as const;
export type ElementElementTypeEnum = typeof ElementElementTypeEnum[keyof typeof ElementElementTypeEnum];

export interface Element {
  [key: string]: any;

  /**
   * the short name of the related document
   * @type {string}
   * @memberof Element
   */
  doc_identifier?: string;
  /**
   * The type of element as given by the related document.
   * @type {string}
   * @memberof Element
   */
  element_type?: ElementElementTypeEnum;
  /**
   * the name of the element. This property might be the identifier that is given to the element by the given document like \'ID.AM-1\' or \'S0009\'. Default value is the string \'N/A\'.
   * @type {string}
   * @memberof Element
   */
  element_identifier?: string;
  /**
   * The title of the element. Some elements may not have titles e.g. ID.AM-1 or S0009. Default value is the string \'N/A\'.
   * @type {string}
   * @memberof Element
   */
  title?: string;
  /**
   * This field represents the text within an element.
   * @type {string}
   * @memberof Element
   */
  text?: string;
}
import { tFormFieldRendererProps, ReadOnlyTextField } from '@rapid-cmi5/ui';

/**
 * @typedef tFormProps
 * @property {FormCrudType} topic Mode for displaying data*/
type tProps = {
  data: Partial<Element>;
  formProps: Partial<tFormFieldRendererProps>;
};

/**
 * Returns additional children to render in KSAT "UUID Inspector"
 * Element Type, Title (or Text)
 * @param {tProps} props
 * @return {JSX.Element} React Component
 */
export default function KsatFieldDetail(props: tProps) {
  const { data, formProps } = props;

  // Safety check for undefined data
  if (!data) {
    return null;
  }

  const titleText = data.title || data.text || '';
  return (
    // fragment needed to do element_identifier test
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {data?.element_identifier ? (
        <>
          <ReadOnlyTextField
            fieldName={`${formProps.indexedArrayField}.title`}
            fieldLabel="Title"
            fieldValue={titleText}
            props={{
              fullWidth: true,
              disabled: formProps.readOnly,
            }}
            sxProps={{
              paddingLeft: '8px',
              minWidth: '350px',
              '& .MuiInputBase-input': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          />
          {/* <ReadOnlyTextField
            fieldName={`${formProps.indexedArrayField}.element_type`}
            fieldLabel="Type"
            fieldValue={data.element_type}
            props={{
              fullWidth: true,
              disabled: formProps.readOnly,
            }}
            sxProps={{ paddingLeft: '8px', minWidth: '125px' }}
          /> */}
        </>
      ) : null}
    </>
  );
}

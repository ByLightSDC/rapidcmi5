/* Branded */
import {
  ReadOnlyTextField,
  tFormFieldRendererProps,
} from '@rangeos-nx/ui/branded';

// import { Element } from '@rangeos-nx/frontend/clients/lms-api';

/**
 * @typedef tFormProps
 * @property {FormCrudType} topic Mode for displaying data*/
type tProps = {
  data: {
    title: string;
    text: string;
    element_identifier: string;
  };
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

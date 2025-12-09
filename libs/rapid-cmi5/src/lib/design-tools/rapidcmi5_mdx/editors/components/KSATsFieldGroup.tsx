import { UseFormReturn } from 'react-hook-form';
import { queryKeyKSATs, Topic } from '@rangeos-nx/ui/api/hooks';
import {
  DynamicSelectorFieldGroup,
  FormFieldArray,
  tFormFieldRendererProps,
} from '@rangeos-nx/ui/branded';

import KsatFieldDetail from './KsatFieldDetail';
import { FormCrudType } from '@rangeos-nx/ui/redux';

/**
 * @type tFieldGroupProps
 * @property {UseFormReturn} formMethods
 * @property {FormCrudType} crudType For Crud Type
 * @property {string} scopedKsatsFieldName field to link ksats to individual activity
 */
type tFieldGroupProps = {
  crudType: FormCrudType;
  formMethods: UseFormReturn;
  //#REF   scopedKsatsFieldName: string;
};

/**
 * KSAT form field array
 * @param {fieldGroupProps} props Component properties
 * @return {JSX.Element} React Component
 */
export function KSATsFieldGroup(props: tFieldGroupProps) {
  const { crudType, formMethods } = props;
  const { formState, getValues, setValue, trigger } = formMethods;
  const { errors } = formState;

  /**
   * Applies multi selected KSAT elements
   */
  const handleSelectMultipleKsats = (selectedItems: any[]) => {
    const newList: Element[] = [];
    selectedItems.map((item) => {
      newList.push(item.meta);
    });

    setValue('ksats', newList, {
      shouldDirty: true, // Explicitly mark as dirty
      shouldTouch: true, // Mark as touched
      shouldValidate: true, // Trigger validation
    });

    // Store in scoped field for React Hook Form state management (not persisted)
    //#REF
    // setValue(scopedKsatsFieldName, newList, {
    //   shouldDirty: true, // Explicitly mark as dirty
    //   shouldTouch: true, // Mark as touched
    //   shouldValidate: true, // Trigger validation
    // });

    // Trigger both fields to ensure form state is updated
    //#REF trigger(['ksats', scopedKsatsFieldName]);
    trigger('ksats');
  };

  /**
   * Applies selected individual KSAT element
   */
  const handleApplyKsatSelection = (
    indexedFieldArray: string,
    selection: any,
  ) => {
    setValue(indexedFieldArray, selection.meta, {
      shouldDirty: true, // Explicitly mark as dirty
      shouldTouch: true, // Mark as touched
      shouldValidate: true, // Trigger validation
    });

    // Store this updated list in scoped field for React Hook Form state management (not persisted)
    // #REF
    // formMethods.setValue(scopedKsatsFieldName, getValues('ksats'), {
    //   shouldDirty: true, // Explicitly mark as dirty
    //   shouldTouch: true, // Mark as touched
    //   shouldValidate: true, // Trigger validation
    // });

    // Trigger both fields to ensure form state is updated
    //#REF trigger(['ksats', scopedKsatsFieldName]);
    trigger('ksats');
  };

  /**
   * Maintains the scoped Ksats for this quiz
   * @param { number} index Index of nameserver being deleted
   */
  //#REF
  //   const handleDeleteKsat = (index: number) => {
  //     if (index > -1) {
  //       const scopedKsats = getValues(scopedKsatsFieldName);
  //       scopedKsats.splice(index, 1);
  //       setValue(scopedKsatsFieldName, scopedKsats);

  //       trigger(scopedKsatsFieldName);
  //     }
  //   };

  return (
    <FormFieldArray
      errors={errors?.ksats}
      arrayFieldName={`ksats`}
      arrayRenderItem={(props: tFormFieldRendererProps) => {
        const ksatFieldName = props.indexedArrayField + '.element_identifier';
        return (
          <DynamicSelectorFieldGroup
            topicId={Topic.KSAT}
            crudType={crudType}
            dataIdField="element_identifier"
            formProps={{
              formMethods,
              fieldName: ksatFieldName,
              indexedArrayField: ksatFieldName,
              indexedErrors: props.indexedErrors?.element_identifier,
              // isModal: isModal,
              // isValid: isValid,
              placeholder: '',
              //determines selectable, viewable
              readOnly: crudType === FormCrudType.view,
            }}
            queryKey={queryKeyKSATs}
            getRenderItems={(data: any, index: number) => {
              if (index === 1) {
                return (
                  <KsatFieldDetail
                    data={getValues(props.indexedArrayField)}
                    formProps={{
                      indexedArrayField: props.indexedArrayField,
                    }}
                  />
                );
              }
              return undefined;
            }}
            inspectorProps={{
              crudType: crudType,
              // editRoute: TopicRoutes.IP,
              shouldFetch: false, //override turned off in design mode
              shouldResolve: false,
              sxInputProps: { minWidth: '125px' },
            }}
            onApplySelection={(fieldName, value) => {
              handleApplyKsatSelection(props.indexedArrayField, value);
            }}
            itemLabel="Element ID"
            shouldShowLabelText={true}
          />
        );
      }}
      defaultValues={{}}
      defaultIsExpanded={false}
      defaultSingleItemView={true}
      expandId={`ksats`}
      isExpandable={true}
      isVisibleDeleteAll={false} // TODO?? delete all doesn't clear the scopedKsatField...
      title="KSATs"
      formMethods={formMethods}
      multiSelectButtonProps={{
        formMethods: formMethods,
        topicId: Topic.KSAT,
        onApply: handleSelectMultipleKsats,
      }}
      //#REF  onDeleteEntry={handleDeleteKsat}
    />
  );
}

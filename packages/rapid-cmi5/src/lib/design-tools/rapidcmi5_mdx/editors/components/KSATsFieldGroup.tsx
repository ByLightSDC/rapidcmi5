import { UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';
import {queryKeyKSATs, Topic} from '@rangeos-nx/frontend/clients/hooks'
import KsatFieldDetail from './KsatFieldDetail';
import { FormCrudType, FormFieldArray, tFormFieldRendererProps, DynamicSelectorFieldGroup } from '@rapid-cmi5/ui';

/**
 * @type tFieldGroupProps
 * @property {UseFormReturn} formMethods
 * @property {FormCrudType} crudType For Crud Type
 * @property {string} scopedKsatsFieldName field to link ksats to individual activity
 */
type tFieldGroupProps = {
  crudType: FormCrudType;
  formMethods: UseFormReturn;
  scopedKsatsFieldName?: string;
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

  const scopedKsatsFieldName = 'ksats';

  // Initialize scoped field from global ksats field if scoped field is empty
  useEffect(() => {
    const globalKsats = getValues('ksats') || [];
    const scopedKsats = getValues(scopedKsatsFieldName) || [];

    // REF
    // console.log('🔍 KSATsFieldGroup initialization:', {
    //   scopedKsatsFieldName,
    //   globalKsats: globalKsats.length,
    //   scopedKsats: scopedKsats.length,
    //   globalKsatsData: globalKsats,
    //   scopedKsatsData: scopedKsats,
    // });

    // If scoped field is empty but global field has data, copy it over
    if (scopedKsats.length === 0 && globalKsats.length > 0) {
      // console.log('🔄 Copying global KSATs to scoped field');
      setValue(scopedKsatsFieldName, globalKsats, {
        shouldDirty: false, // Don't mark as dirty on initialization
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [scopedKsatsFieldName, getValues, setValue]);

  /**
   * Applies multi selected KSAT elements
   */
  const handleSelectMultipleKsats = (selectedItems: any[]) => {
    const newList: Element[] = [];
    selectedItems.forEach((item) => {
      newList.push(item.meta);
    });

    // console.log('🔄 handleSelectMultipleKsats:', {
    //   scopedKsatsFieldName,
    //   selectedItems: selectedItems.length,
    //   newList: newList.length,
    //   newListData: newList,
    // });

    // Store in scoped field (primary field for this activity)
    setValue(scopedKsatsFieldName, newList, {
      shouldDirty: true, // Explicitly mark as dirty
      shouldTouch: true, // Mark as touched
      shouldValidate: true, // Trigger validation
    });

    // Also update the global ksats field for backward compatibility
    setValue('ksats', newList, {
      shouldDirty: true, // Explicitly mark as dirty
      shouldTouch: true, // Mark as touched
      shouldValidate: true, // Trigger validation
    });

    // Trigger both fields to ensure form state is updated
    trigger(['ksats', scopedKsatsFieldName]);
  };

  /**
   * Applies selected individual KSAT element
   */
  const handleApplyKsatSelection = (
    indexedFieldArray: string,
    selection: any,
  ) => {
    // console.log('🔄 handleApplyKsatSelection:', {
    //   indexedFieldArray,
    //   scopedKsatsFieldName,
    //   selection: selection?.meta,
    //   currentScopedKsats: getValues(scopedKsatsFieldName)?.length || 0,
    // });

    // Set the individual field value
    setValue(indexedFieldArray, selection.meta, {
      shouldDirty: true, // Explicitly mark as dirty
      shouldTouch: true, // Mark as touched
      shouldValidate: true, // Trigger validation
    });

    // Get current scoped field values and replace the item at the specific index
    const currentScopedKsats = getValues(scopedKsatsFieldName) || [];
    const fieldIndex = parseInt(indexedFieldArray.split('[')[1].split(']')[0]);
    const updatedScopedKsats = [...currentScopedKsats];
    updatedScopedKsats[fieldIndex] = selection.meta;

    // console.log('🔄 Updated scoped KSATs:', {
    //   fieldIndex,
    //   updatedScopedKsats: updatedScopedKsats.length,
    //   updatedScopedKsatsData: updatedScopedKsats,
    // });

    // Store this updated list in scoped field for React Hook Form state management (not persisted)
    formMethods.setValue(scopedKsatsFieldName, updatedScopedKsats, {
      shouldDirty: true, // Explicitly mark as dirty
      shouldTouch: true, // Mark as touched
      shouldValidate: true, // Trigger validation
    });

    // Also update the global ksats field for backward compatibility
    formMethods.setValue('ksats', updatedScopedKsats, {
      shouldDirty: true, // Explicitly mark as dirty
      shouldTouch: true, // Mark as touched
      shouldValidate: true, // Trigger validation
    });

    // Trigger both fields to ensure form state is updated
    trigger(['ksats', scopedKsatsFieldName]);
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
      errors={errors?.[scopedKsatsFieldName]}
      arrayFieldName={scopedKsatsFieldName}
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
                const fieldData = getValues(props.indexedArrayField);
                return (
                  <KsatFieldDetail
                    data={fieldData || {}}
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
      defaultValues={{
        element_identifier: '',
        element_type: 'knowledge',
        title: '',
        text: '',
        doc_identifier: '',
      }}
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

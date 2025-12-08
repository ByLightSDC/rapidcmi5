import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { modal } from '@rangeos-nx/ui/redux';

/* Branded */
import {
  ActionRow,
  MultipleSelectWrapper,
  actionRowSortableColumns,
} from '@rangeos-nx/ui/branded';

/* Constants */
import { Topic, apiTopicsHookData } from '@rangeos-nx/ui/api/hooks';
import {
  rowsPerPageDefault,
  rowsPerPage_Certificate,
  rowsPerPage_DnsZone,
  rowsPerPage_Scenario,
} from '../constants';

/**
 * Returns the form to be displayed based on modalObj.type
 * @returns {React.ReactElement} or null
 */
export const getMultiSelectModal = (
  modalObjType: string,
  topicId?: string | null,
  shouldSkipQuery?: any,
  defaultPageData?: any[],
) => {
  if (modalObjType === '') {
    return null;
  }

  if (modalObjType !== 'multi-select') {
    return null;
  }

  if (!topicId) {
    return null;
  }

  const topicHookData = apiTopicsHookData[topicId];

  //Custom Params based on topic
  let rowsPerPage = rowsPerPageDefault;
  if (topicId === Topic.Certificate) {
    rowsPerPage = rowsPerPage_Certificate;
  } else if (topicId === Topic.DnsZone) {
    rowsPerPage = rowsPerPage_DnsZone;
  } else if (topicId === Topic.ResourceScenario) {
    rowsPerPage = rowsPerPage_Scenario;
  }

  if (topicHookData || (shouldSkipQuery && defaultPageData)) {
    return (
      <MultipleSelectWrapper
        allowCreateNew={!shouldSkipQuery}
        apiHook={shouldSkipQuery ? null : topicHookData.listApiHook}
        dataIdField={'uuid'}
        defaultPageData={shouldSkipQuery ? defaultPageData : []}
        isTopicEditable={!shouldSkipQuery}
        pageLabel={`${topicId}:s`}
        queryKey={topicHookData.queryKey}
        renderItem={ActionRow}
        rowsPerPage={rowsPerPage}
        sortableColumns={actionRowSortableColumns}
        title={`Select ${topicId}s`}
        topicId={topicId}
        visibleFilters={[]} //no filters for non queried lists
      />
    );
  }
  return null;
};

/**
 * Handles View / Selection modals for Package Form
 * @returns {React.ReactElement}
 */
export default function MultiSelectionModals() {
  const modalObj = useSelector(modal);

  const theMultiSelectModal = useMemo(() => {
    const defaultPageItems = undefined;
    return getMultiSelectModal(
      modalObj.type,
      modalObj.topic,
      modalObj.meta?.shouldSkipQuery,
      defaultPageItems,
    );
  }, [modalObj.type, modalObj.topic, modalObj.meta?.shouldSkipQuery]);

  return (
    <div data-testid="multiple-selection-modals">{theMultiSelectModal}</div>
  );
}

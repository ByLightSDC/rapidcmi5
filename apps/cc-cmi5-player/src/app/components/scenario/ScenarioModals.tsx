import { useSelector } from 'react-redux';




/* Constants */
import { deleteModalId } from './constants';
import { useDeleteRangeResourceScenario } from '@rangeos-nx/frontend/clients/hooks';
import { modal, CrudModals } from '@rapid-cmi5/ui';

/**
 * Props for SelectionModals
 * @type tSelectionModalProps
 * @prop {any} [rangeIdSel] Id of Range
 */
type tScenarioModalProps = {
  rangeIdSel?: string;
  confirmStopButtonText: string;
  stopScenarioMessage: string;
  stopScenarioTitle: string;
};

/**
 * Modals used by Range Resource Scenarios
 * @param {tSelectionModalProps} props
 * @returns
 */
export default function ScenarioModals(props: tScenarioModalProps) {
  const {
    rangeIdSel,
    confirmStopButtonText,
    stopScenarioMessage,
    stopScenarioTitle,
  } = props;
  const modalObj = useSelector(modal);

  return (
    <div data-testid="range-content-modals">
      {modalObj?.meta?.rangeId === rangeIdSel && (
        <CrudModals
          apiHook={useDeleteRangeResourceScenario}
          confirmNameOnDelete={false}
          promptModalId={deleteModalId}
          hookPayload={{
            rangeId: rangeIdSel,
            uuid: modalObj.id,
          }}
          promptMessage={stopScenarioMessage}
          promptTitle={stopScenarioTitle}
          hookOptions={{
            rangeId: rangeIdSel,
          }}
          modalButtonText={['Cancel', confirmStopButtonText]}
          testId={deleteModalId}
        />
      )}
    </div>
  );
}

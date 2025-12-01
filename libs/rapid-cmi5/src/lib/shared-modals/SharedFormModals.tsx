import MultiSelectionModals from './MultiSelectionModals';
import SelectionModals from './SelectionModals';

/**
 * Form Modals component
 * Includes the common selection / view modals for this app
 *
 * @param {boolean} [isModal] Whether form is presented in a modal
 * @returns {React.ReactElement}
 */
/* eslint-disable react/jsx-no-useless-fragment */
export function SharedFormModals({ isModal = false }: { isModal?: boolean }) {
  return (
    <>
      {!isModal && (
        <>
          <MultiSelectionModals />
          <SelectionModals />
        </>
      )}
    </>
  );
}
export default SharedFormModals;

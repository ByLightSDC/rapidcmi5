import { useDispatch, useSelector } from 'react-redux';


/* Constants */
import { useEffect, useState } from 'react';
import { cmi5Instance } from '../session/cmi5';
import {
  setClassId,
  setIsSessionInitialized,
  setRangeData,
} from '../redux/auReducer';
import theForm from './ClassPromptForm';
import { defaultClassEntryData } from '../session/constants';
import { sendClassEventVerb } from '../utils/LmsStatementManager';
import { debugLog, debugLogError } from '../debug';
import { modal, setModal, ModalDialog, FormControlUIProvider, FormCrudType } from '@rapid-cmi5/ui';

export const classPromptModalId = 'prompt-class-id';
export const classChangeModalId = 'change-class-id';
export const classPromptWarningModalId = 'prompt-class-warning';

/**
 * Modals used by Course
 * @param {tSelectionModalProps} props
 * @returns
 */
export default function CourseModals() {
  const modalObj = useSelector(modal);
  const dispatch = useDispatch();

  const previousRegistrationId = window.localStorage.getItem('cmi5-reg');
  const previousClassId = window.localStorage.getItem('cmi5-classId');

  const localRegistration = cmi5Instance?.getLaunchParameters
    ? `${cmi5Instance.getLaunchParameters().registration}-${cmi5Instance.getLaunchParameters()?.activityId?.split('/').pop()}`
    : '';

  const [localClassId, setLocalClassId] = useState(previousClassId);

  const handleCancel = () => {
    if (modalObj.type === classChangeModalId) {
      dispatch(
        setModal({
          type: '',
          id: null,
          name: null,
        }),
      );
      return;
    }

    dispatch(
      setModal({
        type: classPromptWarningModalId,
        id: null,
        name: null,
        meta: {
          title: 'Class Required',
          message: 'Enter a class id and click SAVE.',
        },
      }),
    );
  };

  // re open prompt
  const handleCloseWarning = () => {
    dispatch(setModal({ type: classPromptModalId, id: '', name: '' }));
  };

  const handleSubmitResponse = async (
    isSuccess: boolean,
    data: any,
    message: string,
    payload?: any,
  ) => {
    if (isSuccess) {
      dispatch(setRangeData(data));

      const assignedClassId = data.classId || payload.classId || '';

      // persist reg & class
      window.localStorage.setItem('cmi5-reg', localRegistration);
      window.localStorage.setItem('cmi5-classId', assignedClassId);
      dispatch(setClassId(assignedClassId));
      dispatch(setModal({ type: '', id: null, name: null }));
      dispatch(setIsSessionInitialized(true));
      try {
        sendClassEventVerb(assignedClassId).catch((error) => {
          debugLogError('Error sending classEvent verb to LRS', { error });
        });
      } catch (error) {
        debugLog('ClassEvent verb failed to send  to LRS', error);
      }
    }
  };

  useEffect(() => {
    if (previousRegistrationId) {
      if (localRegistration === previousRegistrationId) {
        setLocalClassId(previousClassId);
        dispatch(setClassId(previousClassId));
      } else {
        setLocalClassId('');
        dispatch(setClassId(''));
      }
    } else {
      //console.log('nothing found');
    }
  }, [previousRegistrationId, previousClassId]);

  useEffect(() => {
    //console.log('inject localClassId', localClassId);
  }, [localClassId]);

  const StyledForm = theForm;

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {modalObj.type !== '' && (
        <div
          data-testid="course-modals"
          style={{
            position: 'absolute',
            zIndex: 1200,
            width: `calc(100vw)`,
            height: `calc(100vh)`,
            // 50% black
            backgroundColor: '#00000080',
          }}
        >
          {/* warning */}
          <ModalDialog
            testId={classPromptWarningModalId}
            buttons={['Okay']}
            dialogProps={{
              open: modalObj.type === classPromptWarningModalId,
            }}
            dialogContentProps={{
              sx: {
                padding: '0px',
              },
            }}
            message={modalObj.meta?.message || ''}
            title={modalObj.meta?.title || 'Warning'}
            handleAction={handleCloseWarning}
          />
          {/* class entry form */}
          <ModalDialog
            buttons={[]}
            dialogProps={{
              open:
                modalObj.type === classPromptModalId ||
                modalObj.type === classChangeModalId,
            }}
            dialogContentProps={{
              sx: {
                padding: '0px',
              },
            }}
          >
            <FormControlUIProvider>
              <StyledForm
                crudType={FormCrudType.create}
                defaultCache={{
                  ...defaultClassEntryData,
                  classId: localClassId,
                }}
                isModal={true}
                uuid={undefined}
                onCancel={handleCancel}
                onClose={handleCancel}
                onResponse={handleSubmitResponse}
              />
            </FormControlUIProvider>
          </ModalDialog>
        </div>
      )}
    </>
  );
}

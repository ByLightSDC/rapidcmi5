/*
Displays form in a page or in a modal
Handles navigation after a form is submitted or canceled
Displays success toaster after sbumit success
OR holds for retry or cancel in the event of a fail
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-no-useless-fragment */
import { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router';
import { commonIds, setCommonId } from '@rangeos-nx/ui/redux';

/* Branded */
import { useToaster } from '../hooks/useToaster';
import { BookmarksContext } from '../navigation/bookmark/BookmarksContext';
import { ButtonMinorUi } from '../inputs/buttons/buttons';
import { FormControlUIProvider } from '../forms/FormControlUIContext';
import { FormCrudType } from '../forms/constants';
import ModalDialog from './ModalDialog';

/* Material */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/*Icons */
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { debugLog } from '../utility/logger';

/* Constants */
const instructions = '';

/**
 * @typedef {Object} tDetailWrapperProps
 * @property {*} [formOrWizardType] For or Wizard to display
 * @property {boolean} [bookmarkEnabled=true] Whether bookmark is enabled for this form
 * @property {string} [boxStyle='contentBox'] Style for box
 * @property {FormCrudType} [crudType] CRUD Method
 * @property {*} [dataCache] Form data from cache
 * @property {string} [isModal] Whether form is popped in modal
 * @property {string} [uuid] UUID for retrieving record
 * @property {string} [uuidIndex] Index of UUID in location path. Ex. -1 is the last element in path. -2 would be second to last.
 * @property {string} [returnToNavId] Nav Id route to return to when back button click
 * @property {string} [returnToTitle] Back button label
 * @property {string} [selectModalId] Modal id for selection
 * @prop {any} [shouldBlockInteraction = true] If true, events will not propogate to content underneath dialog
 * @property {string} [shouldNavToNewRecord] Whether navigate to newly created records after post success
 * @property {string} [shouldReturnToPrevious] Whether back button should return to previous breadcrumb route
 * @property {{() => void}} [onModalClose] Callback when modal closed
 */
type tDetailWrapperProps = {
  formOrWizardType?: any;
  bookmarkEnabled?: boolean;
  boxStyle?: string;
  crudType?: FormCrudType;
  dataCache?: any;
  isModal?: boolean;
  uuid?: string | null;
  uuidIndex?: number;
  returnToNavId?: string;
  returnToTitle?: string;
  shouldBlockInteraction?: boolean; // if false, will allow mouse click,up,down actions to propagate to form
  shouldNavToNewRecord?: boolean;
  shouldReturnToPrevious?: boolean; //if true, will navigate return by popping last entry in route path
  onModalClose?: () => void;
};

/**
 * Presents a form for viewing or editing objects
 * @param {tDetailWrapperProps} props
 * @return {JSX.Element} React Component
 */
export function DetailWrapper(props: tDetailWrapperProps) {
  const {
    crudType = FormCrudType.edit,
    dataCache,
    formOrWizardType,
    uuid,
    uuidIndex = -1,
    bookmarkEnabled = true,
    boxStyle = 'contentBox',
    isModal = false,
    returnToNavId = '',
    returnToTitle = '',
    shouldBlockInteraction = true,
    shouldNavToNewRecord = false,
    shouldReturnToPrevious = true,
    onModalClose,
  } = props;
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const displayToaster = useToaster();
  const dispatch = useDispatch();
  const commonIdsSel = useSelector(commonIds);

  /** @constant
   * Bookmark methods and data
   */
  const { bookmarks, closeForm } = useContext(BookmarksContext);

  //Retrieve id from path if missing from props
  let idSel = uuid || '';
  if (!isModal && crudType !== FormCrudType.create && !uuid) {
    idSel = id || '';
  }

  const handleReturnToPrevious = () => {
    const paths = location.pathname.split('/');
    paths.pop();
    navigate(paths.join('/'), { state: { from: location.pathname } });
  };

  const handleReturn = (data?: any) => {
    //determine where to return to
    const nextRoute = closeForm(data);

    if (isModal) {
      if (nextRoute) {
        //this will be handled by bookmark dispatch of next modal
      } else {
        if (onModalClose) {
          onModalClose();
        }
      }
    } else {
      if (nextRoute) {
        navigate(nextRoute);
      } else {
        if (
          crudType === FormCrudType.create &&
          returnToNavId &&
          shouldNavToNewRecord &&
          data?.uuid
        ) {
          navigate(returnToNavId + '/' + data.uuid, {
            state: { from: location.pathname },
          });
          return;
        }
        //non bookmark flow of routes
        if (shouldReturnToPrevious) {
          handleReturnToPrevious();
          return;
        }
        if (returnToNavId) {
          navigate(returnToNavId, { state: { from: location.pathname } });
        }
      }
    }
  };

  /**
   * Callback for form submission success or fail
   * @param {boolean} isSuccess Whether submission was successful
   * @param {*} data API Response data
   */
  const handleSubmitResponse = (
    isSuccess: boolean,
    data: any,
    message: string,
  ) => {
    if (isSuccess) {
      dispatch(
        setCommonId({
          id: data.uuid,
          name: data.name || data.uuid,
          crudType: crudType || FormCrudType.view,
          meta: data,
          shouldOverride: true,
        }),
      );

      displayToaster({
        message: message,
        severity: 'success',
      });
      handleReturn(data);
    } else {
      //wait here for user to try again OR cancel
    }
  };

  const StyledForm = formOrWizardType;

  let returnBookmarkLabel = undefined;
  if (bookmarkEnabled && bookmarks?.length > 0) {
    const potentialNext =
      bookmarks?.length >= 2 ? bookmarks[bookmarks?.length - 2] : null;
    if (potentialNext?.route) {
      returnBookmarkLabel = potentialNext?.label;
    }
  }

  /**
   * Adds record name to commond ids
   * Useful when cache expires on Form view
   */
  useEffect(() => {
    if (dataCache?.uuid) {
      const alias = commonIdsSel.find(
        (element) => element.id === dataCache?.uuid,
      );
      if (!alias) {
        dispatch(
          setCommonId({
            id: dataCache.uuid,
            name: dataCache.name || dataCache.uuid,
            crudType: crudType || FormCrudType.view,
            meta: dataCache,
            shouldOverride: true,
          }),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isModal) {
    return (
      <ModalDialog
        buttons={[]}
        dialogProps={{
          open: true,
        }}
        maxWidth="lg"
        shouldBlockInteraction={shouldBlockInteraction}
      >
        <FormControlUIProvider>
          <StyledForm
            crudType={crudType}
            dataCache={dataCache} //when modal popped from UIUIDField, etc. data has already been loaded so save an API request
            isModal={isModal}
            uuid={idSel}
            onCancel={handleReturn}
            onClose={handleReturn}
            onResponse={handleSubmitResponse}
          />
        </FormControlUIProvider>
      </ModalDialog>
    );
  }

  return (
    <div id="app-content" style={{ width: '100%' }}>
      <Box className={boxStyle} id="content">
        {instructions && (
          <Typography id="instructions" sx={{ color: 'text.hint' }}>
            {instructions}
          </Typography>
        )}

        <FormControlUIProvider>
          <StyledForm
            crudType={crudType}
            uuid={idSel}
            onCancel={handleReturn}
            onClose={handleReturn}
            onResponse={handleSubmitResponse}
          />
        </FormControlUIProvider>
        {returnToTitle && (
          <Box className={'footer-nav'} id="footer_nav">
            <ButtonMinorUi
              startIcon={<ArrowBackIosIcon />}
              onClick={handleReturn}
            >
              {returnBookmarkLabel || returnToTitle}
            </ButtonMinorUi>
          </Box>
        )}
      </Box>
    </div>
  );
}

export default DetailWrapper;

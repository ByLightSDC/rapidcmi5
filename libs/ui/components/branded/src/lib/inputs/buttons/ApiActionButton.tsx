import { useDispatch } from 'react-redux';

/* MUI */
import { ButtonProps } from '@mui/material/Button';

import { ButtonIcon, ButtonMainUi, ButtonMinorUi } from './buttons';
import { useQueryDetails } from '@rangeos-nx/ui/api/hooks';
import { setLoader } from '@rangeos-nx/ui/redux';
import { useToaster } from '../../hooks/useToaster';
import Tooltip from '@mui/material/Tooltip';

/**
 * @property {any} [apiHook] Hook for API request
 * @property {any} [hookPayload] Payload for API request]
 * @property {string} buttonTitle Title for button
 * @property {JSX.Element}[buttonIcon] Icon to show on button
 * @property {string} [id] Button id
 * @property {boolean} [isButtonIcon=false] Whether to use ButtonIcon instead of MainButtonUI
 * @property {string}[successMsg= 'Success'] Message to display in toaster on success
 * @property {any} [sxProps] Props to override sx properties for button
 */
interface ApiActionButtonProps extends ButtonProps {
  apiHook: any;
  hookPayload?: any;
  buttonTitle: string;
  buttonIcon?: JSX.Element;
  id?: string;
  isButtonIcon?: boolean;
  successMsg?: string;
  sxProps?: any;
}

/**
 * ApiActionButton is used when there is an Api call to be made to do something (example: create a snapshot)
 * but no additional UI needs to be shown
 * @param {ApiActionButtonProps} props
 * @returns {React.ReactElement}
 */
export function ApiActionButton(props: ApiActionButtonProps) {
  const {
    apiHook,
    hookPayload,
    buttonTitle,
    buttonIcon,
    id = 'api-button',
    isButtonIcon = false,
    successMsg = 'Success',
    sxProps,
  } = props;
  const dispatch = useDispatch();
  const displayToaster = useToaster();

  const apiQuery = apiHook(hookPayload);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useQueryDetails({
    queryObj: apiQuery,
    loaderFunction: (isLoading) => {
      dispatch(setLoader(isLoading));
    },
    successFunction: () => {
      displayToaster({
        message: successMsg,
        severity: 'success',
      });
    },
    shouldDisplayToaster: true,
  });

  const handleButtonClick = async () => {
    /**
     * Post Hook
     * @constant
     * @type {any}
     */

    try {
      const apiData = await apiQuery.mutateAsync(hookPayload);
    } catch (error: any) {
      console.log(
        '%c**************error api button click****************',
        'background: red',
        error,
      );
    }
  };

  return (
    // need fragment to do nested test for button type
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {!isButtonIcon ? (
        <ButtonMainUi
          id={id}
          sxProps={sxProps}
          startIcon={buttonIcon}
          onClick={handleButtonClick}
        >
          {buttonTitle}
        </ButtonMainUi>
      ) : (
        <ButtonIcon
          name={id}
          props={{
            onClick: handleButtonClick,
          }}
        >
          <Tooltip
            arrow
            enterDelay={500}
            enterNextDelay={500}
            title={buttonTitle}
          >
            {buttonIcon ? buttonIcon : <></>}
          </Tooltip>
        </ButtonIcon>
      )}
    </>
  );
}
export default ApiActionButton;

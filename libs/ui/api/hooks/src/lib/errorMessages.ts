/* Error Messages */

export type tDisplayError = {
  status: number;
  statusText: string;
  message: string;
  defaultMessage: string;
  errors: any;
};

export const getErrorMessage = (
  error: any,
  defaultMessage: string | undefined = '',
) => {
  let errorMessage: tDisplayError = {
    status: -1,
    statusText: '',
    message: '',
    errors: null,
    defaultMessage: defaultMessage,
  };

  if (!error) {
    return errorMessage;
  }
  if (error?.response) {
    errorMessage.status = error.response.status;
    errorMessage.statusText = error.response.statusText;
    errorMessage.message = error.response.data?.message || defaultMessage;
    errorMessage.errors = error.response.data?.errors;
    return errorMessage;
  }

  if (window?.Response && error instanceof window.Response) {
    errorMessage.status = error.status;
    errorMessage.statusText = error.statusText;
    errorMessage.message = error.url;
    return errorMessage;
  }

  try {
    errorMessage.message = error.toString();
    return errorMessage;
  } catch (error) {}
  return errorMessage;
};

export const getErrorMessageDetail = (
  displayError: any,
  defaultMessage: string | undefined | null = '',
  shouldShowDetail: boolean = false,
) => {
  const optDetailStr = shouldShowDetail
    ? ' (' + displayError?.message + ')'
    : '';
  if (displayError?.defaultMessage) {
    return displayError?.defaultMessage + optDetailStr;
  }

  return defaultMessage + optDetailStr;
};

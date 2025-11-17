/**
 * Make the guac error code something human readable.
 * See https://guacamole.apache.org/doc/0.9.2/gug/protocol-reference.html
 * @param errorCode
 */
export const getTunnelErrorMessage = (errorCode: number) => {
  let msg = errorCode.toString();

  switch (errorCode) {
    case 0:
      msg = 'SUCCESS';
      break;
    case 256:
      msg = 'UNSUPPORTED';
      break;
    case 512:
      msg = 'SERVER_ERROR';
      break;
    case 513:
      msg = 'SERVER_BUSY';
      break;
    case 514:
      msg = 'UPSTREAM_TIMEOUT';
      break;
    case 515:
      msg = 'UPSTREAM_ERROR';
      break;
    case 516:
      msg = 'RESOURCE_NOT_FOUND';
      break;
    case 517:
      msg = 'RESOURCE_CONFLICT';
      break;
    case 768:
      msg = 'CLIENT_BAD_REQUEST';
      break;
    case 769:
      msg = 'CLIENT_UNAUTHORIZED';
      break;
    case 771:
      msg = 'CLIENT_FORBIDDEN';
      break;
    case 776:
      msg = 'CLIENT_TIMEOUT';
      break;
    case 781:
      msg = 'CLIENT_OVERRUN';
      break;
    case 783:
      msg = 'CLIENT_BAD_TYPE';
      break;
    case 797:
      msg = 'CLIENT_TOO_MANY';
      break;
  }

  return msg;
};

export enum ConnectionState {
  Connecting = 'Connecting',
  Success = 'Success',
  ErrorRetry = 'ErrorRetry',
  ErrorFinal = 'ErrorFinal',
}

export enum AlertSeverity {
  info = 'info',
  success = 'success',
  warning = 'warning',
  error = 'error',
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* Clone from GuacamoleTabLinkButton */
/* Branded */

/* Icons */
import TerminalIcon from '@mui/icons-material/Terminal';

import { useEffect } from 'react';
import {
  DeployedRangeConsole,
  DeployedRangeConsoleStatusEnum,
} from '@rapid-cmi5/frontend/clients/devops-api';
import { SxProps } from '@mui/system';
import { ButtonMinorUi } from '@rapid-cmi5/ui/api/hooks';

/**
 * @typedef {Object} tProps
 * @property {Partial<DeployedRangeConsole>} console Console to launch
 * @property {string} [tooltipText]  Button text to display instead of URL in tooltip
 * @property {any} [sxProps] Props to override sx properties for button
 * @property {boolean} [isListItem=false] Whether button is in a list and border should be removed...
 * @property {string} [overrideRangeId] Range id to use when adding console
 */
type tProps = {
  addConsoleWindow: (
    connectionId: string,
    connectionType: string,
    connectionUrl: string,
    title: string,
    resizeMethod: string | null | undefined,
    protocol: string | null,
    overrideRangeId?: string,
  ) => void;
  isConsoleReady: (status?: DeployedRangeConsoleStatusEnum) => boolean;
  rangeOSConsole: Partial<DeployedRangeConsole>;
  tooltipText?: string;
  sxProps?: SxProps;
  isListItem?: boolean;
  allowClickPropagation?: boolean;
  overrideRangeId?: string;
};

/**
 * Displays button for launching Guacamole Console in Browser Tab
 * @param {tProps} props
 * @return {JSX.Element} React Component
 */
export function ConsoleButton(props: tProps) {
  const {
    addConsoleWindow,
    isConsoleReady,
    rangeOSConsole,
    isListItem = false,
    tooltipText,
    allowClickPropagation = false,
    overrideRangeId,
    sxProps = {
      //make button more compact
      color: 'primary',
      margin: '4px',
      padding: '4px',
      height: '26px',
      minHeight: '26px',
    },
  } = props;

  const {
    name,
    details,
    message,
    status,
    protocol = '',
    url,
    parameters,
  } = rangeOSConsole;

  useEffect(() => {
    // refresh for status update
  }, [status]);

  const isDisabled = !isConsoleReady(status);
  const onTerminalIconClicked = (event: React.SyntheticEvent) => {
    if (!allowClickPropagation) {
      event?.stopPropagation();
    }

    if (
      addConsoleWindow &&
      details?.connectionId &&
      details?.connectionType &&
      protocol &&
      url
    ) {
      addConsoleWindow(
        details?.connectionId,
        details?.connectionType,
        url,
        name ? name : protocol,
        parameters?.resizeMethod,
        protocol,
        overrideRangeId,
      );
    }
  };

  const urlTip = url ? `${url}` : '';
  const consoleStatus = `${message}`;
  const buttonTooltip = isDisabled
    ? `Currently Unavailable\n${consoleStatus}`
    : url
      ? tooltipText
        ? tooltipText
        : `Launch ${name}\n${urlTip}`
      : 'No URL Found';

  return (
    <ButtonMinorUi
      id={`console-button`}
      startIcon={
        <TerminalIcon
          sx={{
            fontSize: 'inherit',
            size: 'inherit',
            marginRight: isListItem ? '6px' : undefined,
            marginLeft: '1px',
          }}
        />
      }
      sxProps={sxProps}
      disabled={isDisabled}
      onClick={onTerminalIconClicked}
      tooltip={buttonTooltip}
      variant={isListItem ? 'text' : undefined}
    >
      {protocol}
    </ButtonMinorUi>
  );
}

export default ConsoleButton;

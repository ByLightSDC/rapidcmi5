/* eslint-disable react/jsx-no-useless-fragment */
import React, { useContext } from 'react';

import { DeployedRangeConsole } from '@rapid-cmi5/frontend/clients/devops-api';
import ConsoleButton from './ConsoleButton';
import { ConsoleContext } from './ConsoleContext';
import { SxProps } from '@mui/system';

/**
 * Props for ConsoleList
 * @type Props
 * @prop {Partial<DeployedRangeConsole>[]} [consoles] List of consoles to display
 * @prop {SxProps} [buttonSxProps] Button Style
 */
type Props = {
  consoles: Partial<DeployedRangeConsole>[];
  buttonSxProps?: SxProps;
  overrideRangeId?: string;
};

/**
 * Displays list of Guacamole Consoles
 * @param {Props} props
 * @returns {React.ReactElement}
 */
export function ConsoleList(props: Props) {
  const { consoles, buttonSxProps, overrideRangeId } = props;
  const { addConsoleWindow, isConsoleReady } = useContext(ConsoleContext);
  return (
    <>
      {consoles.length > 0 && (
        <>
          {consoles.map(
            (console: Partial<DeployedRangeConsole>, index: number) => {
              return (
                <ConsoleButton
                  key={index}
                  addConsoleWindow={addConsoleWindow}
                  isConsoleReady={isConsoleReady}
                  rangeOSConsole={console}
                  overrideRangeId={overrideRangeId}
                  sxProps={buttonSxProps}
                />
              );
            },
          )}
        </>
      )}
    </>
  );
}
export default ConsoleList;

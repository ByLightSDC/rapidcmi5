import { useContext } from 'react';
import { ConsoleContext } from './ConsoleContext';

/**
 * Renders console windows
 * @param param0
 * @returns
 */
export function ConsolesDisplay({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  const { consoleWindows } = useContext(ConsoleContext);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return (
    <>
      {children}
      {consoleWindows}
    </>
  );
}

export default ConsolesDisplay;

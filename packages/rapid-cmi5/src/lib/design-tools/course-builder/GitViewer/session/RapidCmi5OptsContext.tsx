import { createContext, useContext } from 'react';
import { RapidCmi5Opts } from '../../../rapidcmi5_mdx/main';

const RapidCmi5OptsContext = createContext<RapidCmi5Opts>({});

export const RapidCmi5OptsProvider = ({
  opts,
  children,
}: {
  opts: RapidCmi5Opts;
  children: JSX.Element;
}) => {
  return (
    <RapidCmi5OptsContext.Provider value={opts}>
      {children}
    </RapidCmi5OptsContext.Provider>
  );
};

export const useRapidCmi5Opts = () => useContext(RapidCmi5OptsContext);

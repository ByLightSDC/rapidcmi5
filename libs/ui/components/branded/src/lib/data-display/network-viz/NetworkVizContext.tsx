import { createContext, useState } from 'react';

interface INetworkVizContext {
  graphSourceData: any;
  graphNodes: any;
  graphEdges: any[];
  isModelCreated: Boolean;
  onGraphSourceDataCreated?: (lGraph: any) => void;
  onModelCreated?: (lGraphNodes: any, lGraphEdges: any) => void;
}

export const NetworkVizContext = createContext<INetworkVizContext>({
  graphSourceData: {},
  graphNodes: [],
  graphEdges: [],
  isModelCreated: false,
});

interface tProviderProps {
  children?: any;
}

//Create Provider
export const NetworkVizContextProvider: any = (props: tProviderProps) => {
  const { children } = props;
  const [graphSourceData, setGraphSourceData] = useState<any>();
  const [graphNodes, setGraphNodes] = useState<any>();
  const [graphEdges, setGraphEdges] = useState<any>([]);
  const [isModelCreated, setModelCreated] = useState(false);

  const onGraphSourceDataCreated = (lGraph: any) => {
    console.log('onGraphSourceDataCreated ', lGraph);
    setGraphSourceData(lGraph);
  };

  const onModelCreated = (lGraphNodes: any, lGraphEdges: any) => {
    //console.log('onModelCreated a', lGraphNodes);
    //console.log('onModelCreated b', lGraphEdges);
    setGraphNodes(lGraphNodes);
    setGraphEdges(lGraphEdges);
    setModelCreated(true);
  };

  return (
    <NetworkVizContext.Provider
      value={{
        graphSourceData: graphSourceData,
        graphNodes: graphNodes,
        graphEdges,
        isModelCreated,
        onModelCreated,
        onGraphSourceDataCreated,
      }}
    >
      {children}
    </NetworkVizContext.Provider>
  );
};

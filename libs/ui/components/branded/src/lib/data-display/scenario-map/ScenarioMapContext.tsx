import { NodeBox } from './models/node-box';
import { Node } from './models/node';
import { Connector } from './models/connector';
import { createContext, useEffect, useState } from 'react';

interface IScenarioMapContext {
  drawFlag: Boolean;
  graph: any;
  graphEdges: any[];
  isModelCreated: Boolean;
  isLayoutInit: Boolean;
  width: number;
  height: number;
  connectors: Connector[];
  messages: string[];
  nodeBoxes: NodeBox[];
  nodes: Node[];
  positions: any;
  onModelCreated?: (
    lNodeBoxes: NodeBox[],
    lNodes: Node[],
    lConnectors: Connector[],
    lGraph: any,
    lGraphEdges: any,
  ) => void;
  onLayoutInit?: (width?: number, height?: number) => void;
  onLayoutUpdated?: (
    positions: any,
    bounds?: [number, number, number, number],
  ) => void;
  onMessage?: (message: string) => void;
}

export const ScenarioMapContext = createContext<IScenarioMapContext>({
  drawFlag: false,
  graph: [],
  graphEdges: [],
  nodeBoxes: [],
  nodes: [],
  width: 0,
  height: 0,
  connectors: [],
  messages: [],
  positions: null,
  isModelCreated: false,
  isLayoutInit: false,
});

interface tProviderProps {
  children?: any;
}

//Create Provider
export const ScenarioMapContextProvider: any = (props: tProviderProps) => {
  const { children } = props;
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [isLayoutInit, setLayoutInit] = useState(false);
  const [isModelCreated, setModelCreated] = useState(false);
  const [graph, setGraph] = useState<any>();
  const [graphEdges, setGraphEdges] = useState<any>([]);
  const [nodeBoxes, setNodeBoxes] = useState<NodeBox[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [positions, setPositions] = useState<any>(null);
  const [drawFlag, setDrawFlag] = useState(false);

  const onModelCreated = (
    lNodeBoxes: NodeBox[],
    lNodes: Node[],
    lConnectors: Connector[],
    lGraph: any,
    lGraphEdges: any,
  ) => {
    //console.log('context says model is created');
    setNodeBoxes(lNodeBoxes);
    setNodes(lNodes);
    setConnectors(lConnectors);
    setModelCreated(true);
    setGraph(lGraph);
    setGraphEdges(lGraphEdges);
  };

  const onLayoutInit = (width: number = 0, height: number = 0) => {
    setWidth(width);
    setHeight(height);
    setLayoutInit(true);
  };

  const onLayoutUpdated = (
    positions: any,
    bounds?: [number, number, number, number],
  ) => {
    setPositions(positions);
    if (bounds) {
      setWidth(bounds[2]);
      setHeight(bounds[3]);
    }
    setDrawFlag(!drawFlag);
  };

  const onMessage = (message: string) => {
    let arr = messages;
    arr.push(message);
    setMessages(arr);
  };

  return (
    <ScenarioMapContext.Provider
      value={{
        drawFlag: drawFlag,
        graph: graph,
        graphEdges: graphEdges,
        isModelCreated: isModelCreated,
        isLayoutInit: isLayoutInit,
        width: width,
        height: height,
        connectors: connectors,
        messages: messages,
        nodeBoxes: nodeBoxes,
        nodes: nodes,
        positions: positions,
        onLayoutInit,
        onLayoutUpdated,
        onModelCreated,
        onMessage,
      }}
    >
      {children}
    </ScenarioMapContext.Provider>
  );
};

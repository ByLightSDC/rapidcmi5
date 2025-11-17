import React, { useContext, useEffect, useState } from 'react';
import { useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BezierEdge,
  Node,
  StepEdge,
  StraightEdge,
  SmoothStepEdge,
  SimpleBezierEdge,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  useUpdateNodeInternals,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CounterNode from './CounterNode';
import TextUpdaterNode from './TextUpdaterNode';

import { useScenarioMapDraw } from './hooks/useScenarioMapDraw';
import { useScenarioMapLayout } from './hooks/useScenarioMapLayout';
import { useScenarioMapModel } from './hooks/useScenarioMapModel';
import { IScenarioMapData } from './scenario-map-data-types';
import { ScenarioMapContext } from './ScenarioMapContext';

export interface ScenarioMapProps {
  testId?: string;
  mapData: IScenarioMapData | null;
}

export function ScenarioMapCanvas({
  testId = 'scenario_map',
  mapData,
}: ScenarioMapProps) {
  const {
    isLayoutInit,
    isModelCreated,
    drawFlag,
    graph,
    graphEdges,
    positions,
    width,
    height,
  } = useContext(ScenarioMapContext);

  //const { setEdges, setNodes } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [refresh, setRefresh] = useState(false);
  //const updateNodeInternals = useUpdateNodeInternals();

  //It's important that the nodeTypes are memoized or defined outside of the component. Otherwise React creates a new object on every render which leads to performance issues
  const nodeTypes = useMemo(
    () => ({ counter: CounterNode, textupdater: TextUpdaterNode }),
    [],
  );

  const edgeTypes = useMemo(
    () => ({
      default: BezierEdge,
      straight: StraightEdge,
      step: StepEdge,
      smoothstep: SmoothStepEdge,
      simplebezier: SimpleBezierEdge,
    }),
    [],
  );

  const myStyle = { backgroundColor: 'pink' };

  /* Add edge when user connects a line to a node port */
  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback(
    (event: any, node: Node) => {
      console.log(event, node);
      expandCollapseToggle(node, nodes, edges);
    },
    [edges, nodes],
  );

  // const onEdgesChange = useCallback(
  //   (changes: any) => {
  //     setEdges((oldEdges) => applyEdgeChanges(changes, oldEdges));
  //   },
  //   [setEdges]
  // );

  // const onNodesChange = useCallback(
  //   (changes: any) => {
  //     setNodes((oldNodes) => applyNodeChanges(changes, oldNodes));
  //   },
  //   [setNodes]
  // );

  const model = useScenarioMapModel();

  const expandCollapseToggle = (clickNode: Node, lNodes: any, lEdges: any) => {
    const clickedOnId = clickNode.id;
    let isToggled = false;
    let shouldBeHidden = false;
    let lines: string[] = [];

    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.source === clickedOnId) {
          if (!isToggled) {
            console.log('toggle hidden from ', edge.hidden);
            shouldBeHidden = !edge.hidden;
            console.log('shouldBeHidden ', shouldBeHidden);
            isToggled = true;
          }
          lines.push(edge.target);

          return {
            ...edge,
            hidden: shouldBeHidden,
          };
        }

        return edge;
      }),
    );

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id !== clickedOnId && lines.includes(node.id)) {
          return {
            ...node,
            hidden: shouldBeHidden,
          };
        }

        return node;
      }),
    );

    console.log('update nodes', nodes);
    //setEdges(lEdges);
    //setNodes(lNodes);

    //setRefresh(!refresh);
  };

  /* Creates Graph Model from DTO
   */
  useEffect(() => {
    //if (mapData) {
    console.log('map data exists createModel');
    model.createModel(mapData);
    //}
  }, [mapData]);

  useEffect(() => {
    if (graph) {
      console.log('graph', graph);
      setNodes(graph);
    }
  }, [graph]);

  useEffect(() => {
    if (graphEdges) {
      console.log('graphEdges', graphEdges);
      setEdges(graphEdges);
    }
  }, [graphEdges]);

  //  useEffect(() => {
  //    setNodes((nds) => nds.map(hide(hidden)));
  //    setEdges((eds) => eds.map(hide(hidden)));
  //  }, [hidden]);

  useEffect(() => {
    //console.log('edges & nodes updated');
  }, [nodes, edges]);

  return (
    <div style={{ height: '100%' }}>
      {nodes && (
        <ReactFlowProvider>
          <ReactFlow
            //defaultNodes={graph}
            //defaultEdges={graphEdges}
            nodes={nodes}
            edges={edges}
            fitView
            //nodesDraggable={false}
            edgeTypes={edgeTypes}
            nodeTypes={nodeTypes}
            panOnDrag={false}
            proOptions={{
              hideAttribution: true,
            }}
            //style={myStyle}
            onConnect={onConnect}
            onNodesChange={onNodesChange}
            onNodeClick={onNodeClick}
            onEdgesChange={onEdgesChange}
          >
            {/* <MiniMap zoomable pannable /> */}
            <Background />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      )}
    </div>
  );
}
export default ScenarioMapCanvas;

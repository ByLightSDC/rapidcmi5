import { useContext, useEffect, useState } from 'react';
import { useCallback, useMemo } from 'react';

import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BezierEdge,
  MiniMap,
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
  useStore,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles.css';

import { brandedTheme } from '../../styles/muiTheme';
import { brandedThemeDark } from '../../styles/muiThemeDark';

import UUIDNode from './UUIDNode';
import CustomEdge from './CustomEdge';
import NetworkVizDetails from './NetworkVizDetails';
import NetworkVizTools from './NetworkVizTools';
import { INetworkVizData } from './network-viz-data-types';
import { NetworkVizContext } from './NetworkVizContext';
import { useScenarioModel } from './hooks/useScenarioModel';

/* MUI */
import { styled } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

export interface NetworkVizProps {
  defaultMapData: INetworkVizData | null;
  flag: number;
  model: any;
  themeColor?: string;
  uuid?: string;
}

export function NetworkVizCanvas({
  flag,
  defaultMapData,
  model,
  themeColor,
  uuid,
}: NetworkVizProps) {
  const modelHook = model();
  const currentTheme = themeColor === 'light' ? brandedTheme : brandedThemeDark;
  const { graphNodes, graphEdges, graphSourceData } =
    useContext(NetworkVizContext);
  const [reactFlowInstance, setReactFlowInstance] = useState<any | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { addRemoveVariables, l3Uuids, mapData, pckgUuids } = useScenarioModel(
    defaultMapData,
    uuid,
  );
  //const updateNodeInternals = useUpdateNodeInternals();

  const nodeTypes = useMemo(() => ({ uuid: UUIDNode }), []);

  const edgeTypes = useMemo(
    () => ({
      default: BezierEdge,
      // straight: StraightEdge,
      // step: StepEdge,
      // smoothstep: SmoothStepEdge,
      // simplebezier: SimpleBezierEdge,
      custom: CustomEdge,
    }),
    [],
  );

  /* Add edge when user connects a line to a node port */
  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback(
    (event: any, node: Node) => {
      console.log('onNodeClick');
      console.log('node', node);
      addRemoveVariables(node.data.meta?.t, node.data.meta?.uuid);
      //console.log(event, node);
      //expandCollapseToggle(node, nodes, edges);
    },
    [edges, nodes],
  );

  //pull from
  // const onNodeDrag = (evt, node) => {
  //   // calculate the center point of the node from position and dimensions
  //   const centerX = node.position.x + node.width / 2;
  //   const centerY = node.position.y + node.height / 2;

  //   // find a node where the center point is inside
  //   const targetNode = nodes.find(
  //     (n) =>
  //       centerX > n.position.x &&
  //       centerX < n.position.x + n.width &&
  //       centerY > n.position.y &&
  //       centerY < n.position.y + n.height &&
  //       n.id !== node.id // this is needed, otherwise we would always find the dragged node
  //   );

  //   setTarget(targetNode);
  // };

  // #region Interactive  Editable
  const onDragOver = useCallback((event: any, node: Node) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      console.log('drop event', event);
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      // const newNode = {
      //   id: 'special', //getId(),
      //   type,
      //   position,
      //   data: { label: `${type} node` },
      // };
      const newNode = {
        id: 'test',
        data: { label: 'New Container', meta: { themeColor: 'light' } },
        position: { x: event.clientX, y: event.clientY },
        //don't set directly width: width,
        //don't set directly height: height,
        type: 'uuid',
        hidden: false,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance],
  );
  // #endregion

  //REF
  // const expandCollapseToggle = (clickNode: Node, lNodes: any, lEdges: any) => {
  //   // const clickedOnId = clickNode.id;
  //   // let isToggled = false;
  //   // let shouldBeHidden = false;
  //   // let lines: string[] = [];
  //   // setEdges((edges) =>
  //   //   edges.map((edge) => {
  //   //     if (edge.source === clickedOnId) {
  //   //       if (!isToggled) {
  //   //         console.log('toggle hidden from ', edge.hidden);
  //   //         shouldBeHidden = !edge.hidden;
  //   //         console.log('shouldBeHidden ', shouldBeHidden);
  //   //         isToggled = true;
  //   //       }
  //   //       lines.push(edge.target);
  //   //       return {
  //   //         ...edge,
  //   //         hidden: shouldBeHidden,
  //   //       };
  //   //     }
  //   //     return edge;
  //   //   })
  //   // );
  //   // setNodes((nodes) =>
  //   //   nodes.map((node) => {
  //   //     if (node.id !== clickedOnId && lines.includes(node.id)) {
  //   //       return {
  //   //         ...node,
  //   //         hidden: shouldBeHidden,
  //   //       };
  //   //     }
  //   //     return node;
  //   //   })
  //   // );
  //   // console.log('update nodes', nodes);
  //   //setEdges(lEdges);
  //   //setNodes(lNodes);
  //   //setRefresh(!refresh);
  // };

  // #region Theme
  // const ReactFlowStyled = styled(ReactFlow)`
  //   background-color: ${(props) => props.theme.bg};
  // `;

  const MiniMapStyled = styled(MiniMap)`
    background-color: ${(props: any) =>
      props.theme.button.disabledBackgroundColor};

    .react-flow__minimap-mask {
      fill: ${(props) => props.theme.palette.grey[800]};
    }

    .react-flow__minimap-node {
      fill: ${(props) => props.theme.palette.grey[600]};
      stroke: none;
    }
  `;

  const ControlsStyled = styled(Controls)`
    button {
      background-color: ${(props) => props.theme.palette.grey[800]};
      color: ${(props) => props.theme.palette.text.primary};
      border-bottom: 1px solid ${(props) => props.theme.palette.text.primary};

      path {
        fill: currentColor; //icon
      }
    }
  `;

  const theControls =
    themeColor === 'dark' ? (
      <ControlsStyled showInteractive={false} />
    ) : (
      <Controls showInteractive={false} />
    );

  const theMiniMap =
    themeColor === 'dark' ? (
      <MiniMapStyled zoomable pannable />
    ) : (
      <MiniMap zoomable pannable />
    );
  // #endregion

  /* Creates Graph Model from DTO
   */
  useEffect(() => {
    if (mapData) {
      console.log('createModel', mapData);
      modelHook.createModel(mapData, { themeColor: themeColor });
    }
  }, [mapData?.netmapScenario?.name]);

  useEffect(() => {
    if (graphNodes) {
      //inject graph nodes with expanded collapsed
      for (let j = 0; j < graphNodes.length; j++) {
        const meta = graphNodes[j].data.meta;

        if (meta.t === 'Package') {
          if (pckgUuids.indexOf(meta.uuid) >= 0) {
            meta.open = 1;
          } else {
            meta.open = 0;
          }
        } else if (meta.t === 'L3') {
          if (l3Uuids.indexOf(meta.uuid) >= 0) {
            meta.open = 1;
          } else {
            meta.open = 0;
          }
        } else {
          meta.open = -1;
        }
      }
      setNodes(graphNodes);
    }
  }, [graphNodes]);

  useEffect(() => {
    if (graphEdges) {
      setEdges(graphEdges);
    }
  }, [graphEdges]);

  useEffect(() => {
    //console.log('edges & nodes updated', nodes);
  }, [nodes, edges]);
  //  {/* <NetworkVizTools /> */}
  return (
    <>
      {nodes?.length === 0 && (
        <div style={{ width: '100%', height: '100%' }}>
          <Box sx={{ margin: '12px' }}>
            <Alert severity="info" sx={{ width: 'auto', maxWidth: '580px' }}>
              No Packages found in this Scenario
            </Alert>
          </Box>
        </div>
      )}
      {/* {graphSourceData && <ButtonMainUi
        //startIcon={<TouchAppIcon />}
        //onClick={() => setMapDialogOpen(true)}
        sxProps={{
          maxWidth: '160px',
        }}
      >
        Graph Source
      </ButtonMainUi>} */}
      {nodes?.length > 0 && edges && (
        <div style={{ height: '100%' }}>
          <ReactFlowProvider>
            {/* <NetworkVizTools /> */}
            <NetworkVizDetails />
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              edgeTypes={edgeTypes}
              nodeTypes={nodeTypes}
              proOptions={{
                hideAttribution: true,
              }}
              style={{
                backgroundColor: currentTheme.palette.background.paper,
                cursor: 'grab',
              }}
              edgesUpdatable={false}
              edgesFocusable={false}
              nodesDraggable={false}
              nodesConnectable={false}
              nodesFocusable={false}
              draggable={false}
              panOnDrag={false}
              elementsSelectable={false}
              onInit={setReactFlowInstance} //editing
              onConnect={onConnect}
              onDrop={onDrop} //editing
              //onDragOver={onDragOver} //editing
              onNodesChange={onNodesChange}
              onNodeClick={onNodeClick}
              onEdgesChange={onEdgesChange}
              zoomOnDoubleClick={false} //must keep this off, reactflow has script error in zoom code 'transition'
            >
              {theMiniMap}
              {/*REF GRID PATTERN <Background /> */}
              {theControls}
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      )}
    </>
  );
}
export default NetworkVizCanvas;

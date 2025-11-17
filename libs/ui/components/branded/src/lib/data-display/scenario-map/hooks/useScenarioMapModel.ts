import { IScenarioMapData, IPackage, IGroup } from '../scenario-map-data-types';
// import Graph from 'graphology';
// import forceLayout from 'graphology-layout-force';
// import noverlap from 'graphology-layout-noverlap';
// import circular from 'graphology-layout/circular';
// import circlepack from 'graphology-layout/circlepack'; //this one looks good

//import dagre from '@dagrejs/dagre';
const ELK = require('elkjs');

import { nodeSize } from '../constants';

import { ScenarioMapContext } from '../ScenarioMapContext';
import {
  NodeType,
  IconType,
  ModelType,
  // SwitchType,
  IModelBase,
  LooseObject,
  NodeBoxType,
} from '../models/model-types';
import { Connector } from '../models/connector';
import { NodeBox } from '../models/node-box';
import { Node } from '../models/node';
import { useContext } from 'react';

export const useScenarioMapModel = () => {
  const { onModelCreated } = useContext(ScenarioMapContext);

  const setChildPosition = (
    childObj: Node,
    lParent: IModelBase,
    lChildIndex: number,
  ) => {
    childObj.parent = lParent;
    childObj.childIndex = lChildIndex;

    const row = Math.ceil((lChildIndex + 1) / (lParent.columnSize * 1.0));
    const col = lChildIndex + 1 - lParent.columnSize * (row - 1);

    childObj.childX = (col - 1) * nodeSize;
    childObj.childY = (row - 1) * nodeSize;
  };

  //list of properties for subnet

  const buildGraph = () => {
    //Graphology
    // const graph = new Graph({
    //   multi: true, //allow parallel edges
    //   allowSelfLoops: true,
    //   type: 'mixed',
    // });

    //Dagre
    // const graph = new dagre.graphlib.Graph();
    // // Set an object for the graph label
    // graph.setGraph({});
    // // Default to assigning a new object as a label for each new edge.
    // graph.setDefaultEdgeLabel(function () {
    //   return {};
    // });

    //ELK
    const graph = new ELK();
    return graph;
  };

  const addNode = (
    graph: any,
    dataProvider: any,
    id: string,
    index: number,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => {
    //graphology
    //graph.addNode(index, { x: 0, y: 0.1 * index, size: width });

    //dagre
    // const labelText = id;
    // graph.setNode(id, {
    //   label: 'cat',
    //   width: 80,
    //   height: 80,
    // });

    //elk
    if (!dataProvider.hasOwnProperty('id')) {
      dataProvider['id'] = 'root';
      dataProvider['layoutOptions'] = { 'elk.algorithm': 'layered' };
      dataProvider['children'] = [];
    }
    let arr = dataProvider['children'];
    arr.push({ id: id, width: width, height: width });
    dataProvider['children'] = arr;
  };

  const addEdge = (
    graph: any,
    dataProvider: any,
    sourceIndex: number,
    targetIndex: number,
  ) => {
    const id = `e${sourceIndex}-${targetIndex}`;
    //graphology
    //graph.addEdge(sourceIndex, targetIndex, { name: id });

    //dagre
    // graph.setEdge('' + sourceIndex, '' + targetIndex);

    //elk
    if (!dataProvider.hasOwnProperty('edges')) {
      dataProvider['edges'] = [];
    }
    let arr = dataProvider['edges'];
    arr.push({
      id: id,
      sources: ['' + sourceIndex],
      targets: ['' + targetIndex],
    });
    dataProvider['edges'] = arr;
  };

  const getPositions = async (
    graph: any,
    dataProvider: any,
    nodeList: any,
  ): Promise<any> => {
    //Graphology
    // const positions = noverlap(graph, {
    //   maxIterations: 50,
    //   settings: {
    //     gridSize: 640,
    //     margin: 8,
    //     ratio: 1,
    //   },
    // });
    // const positions = forceLayout(graph, {
    //   maxIterations: 50,
    //   settings: {
    //     gravity: 10,
    //   },
    // });

    //const positions = circlepack(graph);
    //const positions = circular(graph);
    //const positions = forceLayout(graph, { maxIterations: 50 });

    //DAGRE
    // dagre.layout(graph);
    // const positions = graph.nodes();

    //ELK
    const layoutData = await graph.layout(dataProvider);
    const positions = layoutData.children;

    graph.layout(dataProvider).then((layoutData: any) => {
      return layoutData.children;
    });

    //console.log('positions', positions);
    return positions;
  };

  const getReactFlowPosition = (
    index: number,
    label: string,
    meta: any,
    width: number,
    height: number,
    type: string,
    isVisible: boolean,
    parent: string,
  ) => {
    let rr: { [key: string]: unknown } = {
      id: '' + index, //nodeList[index].id,
      //type: 'input',
      data: { label: label, meta: { test: 'mico' } },
      position: { x: meta['x'], y: meta['y'] },
      width: width,
      height: height,
      type: type,
      hidden: !isVisible,
    };
    if (parent) {
      rr = { ...rr, parentNode: parent, extend: 'parent' };
    }
    return rr;
  };

  const createModel = async (data: IScenarioMapData | null) => {
    console.log('createModel');

    const graph = buildGraph();

    let nodeBoxList: NodeBox[] = [];
    let nodeList: Node[] = [];
    let connectors: Connector[] = [];
    let dataProvider = {};

    //React Flow Edges
    let graphEdges: any[] = [];

    graphEdges.push({ id: 'e0-1', source: '0', target: '1', hidden: true });
    graphEdges.push({ id: 'e0-2', source: '0', target: '2', hidden: true });
    graphEdges.push({ id: 'e0-3', source: '0', target: '3', hidden: true });
    graphEdges.push({ id: 'e0-4', source: '0', target: '4', hidden: true });
    graphEdges.push({ id: 'e0-5', source: '0', target: '5', hidden: true });
    //graphEdges.push({ id: 'e6-7', source: '6', target: '7' });
    graphEdges.push({ id: 'e6-8', source: '6', target: '8', hidden: false });

    //Add Scenario
    let counter = 0;
    let obj = new Node('scenario', ModelType.NODE);
    obj.setName('Demo Attack Scenario');
    //obj.setNodeType(NodeType.DEFAULT);
    nodeList.push(obj);
    //graphology

    addNode(
      graph,
      dataProvider,
      '' + counter,
      counter,
      0,
      0.1 * counter,
      nodeSize,
      nodeSize,
    );
    counter++;
    //Add Packages
    let p1 = new Node('package1', ModelType.NODE);
    p1.setName('Networks');
    p1.setVisible(false);
    //p1.setNodeType(NodeType.DEFAULT);
    nodeList.push(p1);
    addNode(
      graph,
      dataProvider,
      '' + counter,
      counter,
      0,
      0.1 * counter,
      nodeSize,
      nodeSize,
    );
    counter++;
    let p2 = new Node('package2', ModelType.NODE);
    p2.setName('Routers');
    p2.setVisible(false);
    //p2.setNodeType(NodeType.DEFAULT);
    nodeList.push(p2);
    addNode(
      graph,
      dataProvider,
      '' + counter,
      counter,
      0,
      0.1 * counter,
      nodeSize,
      nodeSize,
    );
    counter++;
    let p3 = new Node('package3', ModelType.NODE);
    p3.setName('Caldera');
    p3.setVisible(false);
    //p3.setNodeType(NodeType.DEFAULT);
    nodeList.push(p3);
    addNode(
      graph,
      dataProvider,
      '' + counter,
      counter,
      0,
      0.1 * counter,
      nodeSize,
      nodeSize,
    );
    counter++;
    let p4 = new Node('package4', ModelType.NODE);
    p4.setName('Windows');
    p4.setVisible(false);
    //p4.setNodeType(NodeType.DEFAULT);
    nodeList.push(p4);
    addNode(
      graph,
      dataProvider,
      '' + counter,
      counter,
      0,
      0.1 * counter,
      nodeSize,
      nodeSize,
    );
    counter++;
    let p5 = new Node('package5', ModelType.NODE);
    p5.setName('Ubuntu');
    p5.setVisible(false);
    //p5.setNodeType(NodeType.DEFAULT);
    nodeList.push(p5);
    addNode(
      graph,
      dataProvider,
      '' + counter,
      counter,
      0,
      0.1 * counter,
      nodeSize,
      nodeSize,
    );
    counter++;

    //parent node
    let s1 = new Node('solo1', ModelType.NODE);
    s1.setName('Solo');
    s1.setParent('3');
    //s1.setNodeType(NodeType.DEFAULT);
    nodeList.push(s1);
    addNode(
      graph,
      dataProvider,
      '' + counter,
      counter,
      0,
      0.1 * counter,
      nodeSize,
      nodeSize,
    );
    counter++;

    //unattached node
    // let s1 = new Node('solo1', ModelType.NODE);
    // s1.setName('Solo');
    // //s1.setNodeType(NodeType.DEFAULT);
    // nodeList.push(s1);
    // addNode(
    //   graph,
    //   dataProvider,
    //   '' + counter,
    //   counter,
    //   0,
    //   0.1 * counter,
    //   nodeSize,
    //   nodeSize
    // );
    // counter++;

    // //custom node
    // let c1 = new Node('custom1', ModelType.NODE);
    // c1.setName('Custom');
    // c1.setNodeType(NodeType.COUNTER);
    // nodeList.push(c1);
    // addNode(
    //   graph,
    //   dataProvider,
    //   '' + counter,
    //   counter,
    //   0,
    //   0.1 * counter,
    //   nodeSize,
    //   nodeSize
    // );
    // counter++;

    // //custom node
    // let t1 = new Node('custom1', ModelType.NODE);
    // t1.setName('Custom Text');
    // t1.setNodeType(NodeType.TEXTUPDATER);
    // nodeList.push(t1);
    // addNode(
    //   graph,
    //   dataProvider,
    //   '' + counter,
    //   counter,
    //   0,
    //   0.1 * counter,
    //   nodeSize,
    //   nodeSize
    // );
    // counter++;

    console.log('Count Nodes = ', nodeList.length);

    //const graphPositions = forceLayout(graph, { maxIterations: 50 });
    addEdge(graph, dataProvider, 0, 1);
    addEdge(graph, dataProvider, 0, 2);
    addEdge(graph, dataProvider, 0, 3);
    addEdge(graph, dataProvider, 0, 4);
    addEdge(graph, dataProvider, 0, 5);

    //Layout Plugin
    const positions = await getPositions(graph, dataProvider, nodeList);

    //console.log('LINE', 318);
    //graphology or elk OBJ
    let graphPositions = Object.entries(positions).map(
      ([key, value], index) => {
        //console.log('iii', key);
        //console.log(index, nodeList[index]);
        const rr = getReactFlowPosition(
          index,
          nodeList[index].name,
          value,
          nodeSize,
          nodeSize,
          nodeList[index].nodeType,
          nodeList[index].visible,
          nodeList[index].parent,
        );
        console.log('rr', rr);
        return rr;
      },
    );

    //dagre ARRAY
    // let graphPositions = [];
    // for (let i = 0; i < positions.length; i++) {
    //   dagre
    //   const value = graph.node(positions[i]);
    //   const rr = getReactFlowPosition(
    //     i,
    //     nodeList[i].name,
    //     value,
    //     nodeSize,
    //     nodeSize,
    // nodeList[index].nodeType
    //   );

    //   console.log('node', rr);
    //   graphPositions.push(rr);
    // }

    //console.log('AFTER positions', graphPositions);

    //Fix up positions so they can be rendered by whatever plug in

    if (onModelCreated) {
      onModelCreated(
        nodeBoxList,
        nodeList,
        connectors,
        graphPositions,
        graphEdges,
      );
    }
  };

  return {
    createModel,
  };
};

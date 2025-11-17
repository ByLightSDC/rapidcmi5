import { useContext, useEffect, useState } from 'react';

import {
  INetworkVizData,
  INetmapPackages,
  INetmapScenarioLinks,
  NetmapNodeType,
} from '../network-viz-data-types';

const ELK = require('elkjs');

import { NetworkVizContext } from '../NetworkVizContext';

interface IElky {
  id: string;
  width: number;
  height: number;
  $H: number;
  x: number;
  y: number;
}

type DebugDraw = {
  routers: boolean;
  l3: boolean;
  containers: boolean;
  vms: boolean;
  packageConnections: boolean;
  extraConnections: boolean;
};

export const useElkLayout = () => {
  const { onModelCreated, onGraphSourceDataCreated } =
    useContext(NetworkVizContext);
  const [metaData, setMetaData] = useState<{ [key: string]: any }>({});
  const padding2Test = '[top=100,left=100,bottom=100,right=100]';
  const paddingTest = '[top=60,left=60,bottom=20,right=60]';
  const shouldDrawCrossLayer = false;
  const nodeNodeBetweenLayers = '100';

  // const connectedLayerOptions = {
  //   //'elk.^position': '100, 0',
  //   'elk.layered.layering.layerConstraint': 'LAST',
  //   'elk.padding': padding2Test,
  //   'elk.layered.spacing.nodeNodeBetweenLayers': '100', //h space between obj in package
  // };

  const childLayerOptions = {
    'elk.padding': paddingTest,
    'elk.layered.spacing.nodeNodeBetweenLayers': '100', //h space between obj in package
    //BEFORE
    //TEMP'elk.direction': 'LEFT',
    'elk.direction': 'RIGHT',
    //'elk.algorithm': 'layered',
    //'elk.spacing.nodeNode': '100',
    //'elk.spacing.labelNode': '100',
    //'elk.hierarchyHandling': 'SEPARATE_CHILDREN',
    //'elk.alignment': 'AUTOMATIC',
    //'elk.alignment': 'RIGHT',
  };
  const packageLayerOptions = {
    'elk.padding': paddingTest,
    'elk.layered.spacing.nodeNodeBetweenLayers': '100', //h space between obj in package
    'elk.direction': 'RIGHT',
    //'elk.alignment': 'RIGHT',
    //'elk.layered.nodePlacement.bk.fixedAlignment': 'RIGHTDOWN',
  };

  // const packageLayerOptions = {
  //   //DNW 'elk.spacing': '[top=125,left=25,bottom=25,right=25]',
  //   //'elk.algorithm': 'layered',
  //   //'elk.algorithm': 'elk.force',
  //   'elk.padding': paddingTest,
  //   //BEFORE
  //   //'elk.direction': 'LEFT',
  //   //'elk.spacing.nodeNode': '100',
  //   //'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  //   //'elk.spacing.labelNode': '100',
  //   //'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
  // };
  const rootLayerOptions = {
    'elk.algorithm': 'layered',
    //'elk.algorithm': 'elk.rectpacking',
    'elk.direction': 'RIGHT',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100', //h space between packages **spacing to be preserved between any pair of nodes of two adjacent layers

    'elk.nodeLabels.placement': 'H_LEFT V_TOP', //OUTSIDE
    'elk.spacing.labelNode': '100',
    //this causes mega problems
    //'elk.hierarchyHandling': 'INCLUDE_CHILDREN', //allows you to connect edges between layers, but layout does not look as good
    //BEFORE
    //'elk.spacing.nodeNode': '100', //spacing between nodes within the layer itself
    'elk.aspectRatio': '1.8f',
    //'elk.alignment': 'RIGHT',
  };

  const buildGraph = () => {
    const graph = new ELK();
    return graph;
  };

  const consolelog = (m1?: any, m2?: any) => {
    //console.log(m1, m2);
  };

  const recurseFind = (dp: any, uuid: string): any => {
    return findNode(dp, uuid);
  };

  const findNode = (dp: any, uuid: string): any => {
    if (dp['children']) {
      const node = dp['children'].find((n: any) => n.id === uuid);
      if (node) {
        return node;
      } else {
        for (let i = 0; i < dp['children'].length; i++) {
          return recurseFind(dp['children'][i], uuid);
        }
      }
    } else {
      return null;
    }
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
    parent: string,
  ) => {
    //elk
    if (!dataProvider.hasOwnProperty('id')) {
      dataProvider['id'] = 'root';
      dataProvider['layoutOptions'] = rootLayerOptions;
      dataProvider['children'] = [];
    }

    const theChild = {
      id: id,
      width: width,
      height: height,
      layoutOptions: childLayerOptions,
    };

    if (parent) {
      const theParent = findNode(dataProvider, parent);

      if (theParent) {
        //consolelog('theParent', theParent);
        if (!theParent.hasOwnProperty('children')) {
          theParent['children'] = [theChild];
        } else {
          theParent['children'].push(theChild);
        }
      }
    } else {
      //consolelog('no parent', id);
      //these are packages!! but we should probably pass type in
      console.log('package', id);
      theChild.layoutOptions = packageLayerOptions;
      let arr = dataProvider['children'];
      arr.push(theChild);
      dataProvider['children'] = arr;
    }
  };

  const addEdge = (
    graph: any,
    dataProvider: any,
    rfEdges: any[],
    sourceId: string,
    targetId: string,
    uuid: string,
    isCrossLayerNetwork: boolean,
  ) => {
    const id = `**${sourceId}**${targetId}`;

    let theParent = dataProvider;
    // if (parentId) {
    //   theParent = findNode(dataProvider, parentId);
    // }

    if (!theParent.hasOwnProperty('edges')) {
      theParent['edges'] = [];
    }
    let arr = dataProvider['edges'];

    arr.push({
      id: id,
      sources: [sourceId],
      targets: [targetId],
    });
    dataProvider['edges'] = arr;

    let rfEdge: any = {
      id: id,
      source: sourceId,
      target: targetId,
      type: 'custom',
      hidden: false,
      data: { label: uuid.slice(0, 4) + '...' },
    };

    if (isCrossLayerNetwork) {
      rfEdge['sourceHandle'] = 'package';
      rfEdge['targetHandle'] = 'package';
    }

    rfEdges.push(rfEdge);
  };

  const getLayout = async (graph: any, dataProvider: any): Promise<any> => {
    const layoutData = await graph.layout(dataProvider);
    let layout = layoutData.children;
    return layout;
  };

  const getReactFlowNode = (
    index: number | string,
    graphMeta: any,
    label: string,
    meta: any,
    width: number,
    height: number,
    type: string,
    isVisible: boolean,
    parent: string,
    globalProps: { [key: string]: any },
  ) => {
    meta.themeColor = globalProps['themeColor'];
    let rr: { [key: string]: unknown } = {
      id: '' + index, //nodeList[index].id,
      //type: 'input',
      data: { label: label, meta: meta },
      position: { x: graphMeta['x'], y: graphMeta['y'] },
      //don't set directly width: width,
      //don't set directly height: height,
      type: type,
      hidden: !isVisible,
    };

    // if (label === 'BlueSpace') {
    //   rr = { ...rr, position: { x: graphMeta['x'], y: 0 } };
    // }

    if (parent) {
      rr = { ...rr, parentNode: parent, extend: 'parent' };
    }
    return rr;
  };

  const shouldDraw: DebugDraw = {
    routers: true,
    l3: true,
    containers: true,
    vms: true,
    packageConnections: true,
    extraConnections: true,
  };

  const createModel = async (
    data: INetworkVizData | null,
    globalProps: any,
  ) => {
    consolelog('createModel from', data);

    const graph = buildGraph();

    const nodeWidth = 320;
    const nodeHeight = 60;
    let counter = 0;
    let dataProvider = {};
    let metaById: { [key: string]: any } = {};
    let graphEdges: any[] = [];

    let added: string[] = [];
    let addedScenarioLinks: string[] = [];
    //Define Graph Nodes

    const packages: INetmapPackages[] = data?.netmapScenario?.netmapPackages
      ? data?.netmapScenario?.netmapPackages
      : [];

    //Loop packages
    if (packages?.length > 0) {
      packages.map((p: INetmapPackages) => {
        //Add node for package
        metaById[p.uuid] = p;
        addNode(
          graph,
          dataProvider,
          p.uuid, //'' + counter,
          counter,
          0,
          0.1 * counter,
          nodeWidth,
          nodeHeight,
          '',
        );
        added.push(p.uuid);
        metaById[p.uuid]['t'] = NetmapNodeType.PACKAGE;
        counter++;

        if (shouldDraw.routers) {
          const routers: any[] = p.rangeRouterCollection
            ? p.rangeRouterCollection
            : [];

          //Loop Routers
          routers.map((r: any) => {
            //Add node for router
            metaById[r.uuid] = r;
            addNode(
              graph,
              dataProvider,
              r.uuid,
              counter,
              0,
              0.1 * counter,
              nodeWidth,
              nodeHeight,
              p.uuid,
            );
            metaById[r.uuid]['t'] = NetmapNodeType.RANGEROUTER;
            added.push(r.uuid);
            counter++;
          });
        }
        if (shouldDraw.l3) {
          const l3Networks: any[] = p.netmapRangeL3Networks
            ? p.netmapRangeL3Networks
            : [];

          //Loop L3
          l3Networks.map((n: any) => {
            //Add node for subnet
            metaById[n.uuid] = n;
            addNode(
              graph,
              dataProvider,
              n.uuid,
              counter,
              0,
              0.1 * counter,
              nodeWidth,
              nodeHeight,
              p.uuid,
            );
            metaById[n.uuid]['t'] = NetmapNodeType.L3;
            added.push(n.uuid);
            counter++;

            if (n.container && n.container.hasOwnProperty('rangeContainers')) {
              const childContainers: any[] = n.container.rangeContainers
                ? n.container.rangeContainers
                : [];

              //Loop Child Containers
              for (let i = 0; i < childContainers.length; i++) {
                //find container
                if (p.containerSpecificationCollection) {
                  const theContainer = p.containerSpecificationCollection.find(
                    (n: any) => n.uuid === childContainers[i].uuid,
                  );
                  // consolelog('result', theContainer);
                  if (theContainer) {
                    //consolelog('Add a L3 Child', theContainer.uuid);
                    //Add node for child container
                    metaById[theContainer.uuid] = theContainer;
                    addNode(
                      graph,
                      dataProvider,
                      theContainer.uuid,
                      counter,
                      0,
                      0.1 * counter,
                      nodeWidth,
                      nodeHeight,
                      n.uuid,
                    );
                    metaById[theContainer.uuid]['t'] = NetmapNodeType.CONTAINER;
                    added.push(theContainer.uuid);
                    counter++;
                  }
                }
              }
            }

            if (n.container && n.container.hasOwnProperty('rangeVms')) {
              const childVMs: any[] = n.container.rangeVms
                ? n.container.rangeVms
                : [];

              //Loop Child VMs
              for (let i = 0; i < childVMs.length; i++) {
                //find container
                if (p.vmSpecificationCollection) {
                  const theVM = p.vmSpecificationCollection.find(
                    (n: any) => n.uuid === childVMs[i].uuid,
                  );
                  //consolelog('result', theVM);
                  if (theVM) {
                    //consolelog('Add a L3 Child', theVM.uuid);
                    //Add node for child container
                    metaById[theVM.uuid] = theVM;
                    addNode(
                      graph,
                      dataProvider,
                      theVM.uuid,
                      counter,
                      0,
                      0.1 * counter,
                      nodeWidth,
                      nodeHeight,
                      n.uuid,
                    );
                    metaById[theVM.uuid]['t'] = NetmapNodeType.VM;
                    added.push(theVM.uuid);
                    counter++;
                  }
                }
              }
            }
          });
        }

        const packageContainers: any[] = p.containerSpecificationCollection
          ? p.containerSpecificationCollection
          : [];

        //Loop Package Containers
        if (shouldDraw.containers) {
          for (let i = 0; i < packageContainers.length; i++) {
            //find container

            const theContainer = packageContainers[0];

            if (added.indexOf(theContainer.uuid) < 0) {
              //consolelog('Add Package Container', theContainer.uuid);
              //Add node for child container
              metaById[theContainer.uuid] = theContainer;
              addNode(
                graph,
                dataProvider,
                theContainer.uuid,
                counter,
                0,
                0.1 * counter,
                nodeWidth,
                nodeHeight,
                p.uuid,
              );
              metaById[theContainer.uuid]['t'] = NetmapNodeType.RANGECONTAINER;
              added.push(theContainer.uuid);
              counter++;
            }
          }
        }

        if (shouldDraw.vms) {
          const packageVMs: any[] = p.vmSpecificationCollection
            ? p.vmSpecificationCollection
            : [];

          //Loop Child VMs
          for (let i = 0; i < packageVMs.length; i++) {
            //find container
            const theVM = packageVMs[0];
            //consolelog('result', theVM);
            if (added.indexOf(theVM.uuid) < 0) {
              //consolelog('Add a Package VM', theVM.uuid);
              //Add node for child container
              metaById[theVM.uuid] = theVM;
              addNode(
                graph,
                dataProvider,
                theVM.uuid,
                counter,
                0,
                0.1 * counter,
                nodeWidth,
                nodeHeight,
                p.uuid,
              );
              metaById[theVM.uuid]['t'] = NetmapNodeType.VM;
              added.push(theVM.uuid);
              counter++;
            }
          }
        }
      });
    }

    //Package connections
    const scenarioLinks: INetmapScenarioLinks[] = data?.netmapScenario
      ?.scenarioNetworkLinks
      ? data?.netmapScenario?.scenarioNetworkLinks
      : [];

    if (shouldDraw.packageConnections) {
      if (scenarioLinks?.length > 0) {
        for (let i = 0; i < scenarioLinks.length; i++) {
          const pkgs: any[] = scenarioLinks[i].packages || [];
          //consolelog('edge ' + pkgs[0].uuid, pkgs[1].uuid);
          if (pkgs.length > 1) {
            addedScenarioLinks.push(scenarioLinks[i].uuid);
            addEdge(
              graph,
              dataProvider,
              graphEdges,
              pkgs[0].uuid,
              pkgs[1].uuid,
              scenarioLinks[i].uuid,
              false,
            );
          }
        }
      }
    }

    if (shouldDraw.extraConnections) {
      //Now add Child Connectors
      if (packages?.length > 0) {
        packages.map((p: INetmapPackages) => {
          const packageNetworks: any[] = p.packageNetworkLinks
            ? p.packageNetworkLinks
            : [];

          //Loop Package Containers
          for (let i = 0; i < packageNetworks.length; i++) {
            const theNetwork = packageNetworks[i];
            const someContainers = packageNetworks[i].rangeContainers || [];
            const someL3s = packageNetworks[i].rangeL3Networks || [];
            const someRouters = packageNetworks[i].rangeRouters || [];
            const someVMs = packageNetworks[i].rangeVms || [];
            let connectedNodes = someContainers
              .concat(someL3s)
              .concat(someRouters)
              .concat(someVMs);
            if (addedScenarioLinks.indexOf(theNetwork.uuid) < 0) {
              //const source = packageNetworks[i];
              //addEdge(graph, dataProvider, graphEdges, pkgs[0].uuid, pkgs[1].uuid);
              if (connectedNodes.length === 0) {
                consolelog('No connections found');
              } else if (connectedNodes.length === 2) {
                consolelog(
                  'edge ' + connectedNodes[0].uuid,
                  connectedNodes[1].uuid,
                );
                addEdge(
                  graph,
                  dataProvider,
                  graphEdges,
                  connectedNodes[0].uuid,
                  connectedNodes[1].uuid,
                  theNetwork.uuid,
                  false,
                );
              } else {
                // for (let j = 0; j < connectedNodes.length; j++) {
                //   if (shouldDrawCrossLayer) {
                //     addEdge(
                //       graph,
                //       dataProvider,
                //       graphEdges,
                //       connectedNodes[j].uuid,
                //       p.uuid,
                //       theNetwork.uuid,
                //       true
                //     );
                //   } else {
                //     graphEdges.push({
                //       id: `**${connectedNodes[j].uuid}**${p.uuid}`,
                //       source: connectedNodes[j].uuid,
                //       sourceHandle: 'package',
                //       target: p.uuid,
                //       targetHandle: 'package',
                //       hidden: false,
                //       type: 'custom',
                //       data: { label: theNetwork.uuid.slice(0, 4) + '...' },
                //     });
                //   }
                // }
              }
            } else {
              //routers, containers, etc connecting to a scenario network
              //TODO 2+ things connect to another network
              //test first one edge to edge
              // console.log('edge to edge');
              // console.log(connectedNodes[0].uuid, theNetwork.uuid);
              //

              //elk doesnt handle connections between layers unless layout option is turned on
              // we can just add connections directly to react flow instead
              //but we need to force connecting from right port to right port of package

              for (let j = 0; j < connectedNodes.length; j++) {
                if (shouldDrawCrossLayer) {
                  addEdge(
                    graph,
                    dataProvider,
                    graphEdges,
                    connectedNodes[j].uuid,
                    p.uuid,
                    theNetwork.uuid,
                    true,
                  );
                } else {
                  graphEdges.push({
                    id: `**${connectedNodes[j].uuid}**${p.uuid}`,
                    source: connectedNodes[j].uuid,
                    sourceHandle: 'package',
                    target: p.uuid,
                    targetHandle: 'package',
                    hidden: false,
                    type: 'custom',
                    data: { label: theNetwork.uuid.slice(0, 4) + '...' },
                  });
                }
              }
            }
          }
        });
      }
    }

    //Layout Position Data
    if (onGraphSourceDataCreated) {
      onGraphSourceDataCreated(JSON.parse(JSON.stringify(dataProvider)));
    }
    console.log('Before Graph ', dataProvider);

    if (counter <= 0) {
      return;
    }
    //return;

    const layout = await getLayout(graph, dataProvider);

    consolelog('After Graph ', layout);

    let graphPositions: any[] = [];

    const recurseChildren = (
      children: any[],
      rfArr: any[],
      rfParent: string,
    ) => {
      let counter = rfArr.length;

      for (let i = 0; i < children.length; i++) {
        const elkNode = children[i];
        const meta = metaById[elkNode?.id];
        meta.open = -1;
        //for parent containers
        meta.width = elkNode.width;
        meta.height = elkNode.height;
        //console.log(elkNode?.id, elkNode);
        //build node
        const rfNode = getReactFlowNode(
          meta.uuid, //counter,
          elkNode,
          meta.name + ' (' + meta['t'] + ')',
          meta,
          elkNode.width,
          elkNode.height,
          NetmapNodeType.UUID,
          true,
          rfParent,
          globalProps,
        );
        //console.log('rf', rfNode);
        counter++;
        doIt(elkNode, rfNode, rfArr);
      }
    };

    const doIt = (eNode: any, aNode: any, rfArr: any[]) => {
      //console.log('Add It');
      rfArr.push(aNode);
      if (eNode.hasOwnProperty('children') && eNode['children'].length > 0) {
        recurseChildren(eNode['children'], rfArr, eNode.id);
      }
    };

    //Build React Flow Nodes
    Object.entries(layout).map((d) => {
      //console.log('iii', key); //this is index
      //const index = d[0];
      const elkNode = d[1] as IElky;
      const meta = metaById[elkNode?.id];
      //for parent containers
      meta.width = elkNode.width;
      meta.height = elkNode.height;

      //const meta = metaById['id'];
      let isVisible = true;
      let nodeType = NetmapNodeType.UUID;
      let parent = '';

      //graphPositions.length
      const rfNode = getReactFlowNode(
        meta.uuid,
        elkNode,
        meta.name + ' (' + meta['t'] + ')',
        meta,
        elkNode.width,
        elkNode.height,
        nodeType,
        isVisible,
        parent,
        globalProps,
      );
      //console.log('level 1 RF', rfNode);
      doIt(elkNode, rfNode, graphPositions);

      return rfNode;
    });

    setMetaData(metaById);
    consolelog('Final graphPositions', graphPositions);
    consolelog('Final graphEdges', graphEdges);
    //graphEdges
    if (onModelCreated) {
      onModelCreated(graphPositions, graphEdges);
    }
  };

  const updateModel = async (graph: any, globalProps: any) => {
    consolelog('updateModel from', graph);
    //const nodeWidth = 320;
    //const nodeHeight = 60;
    //let counter = 0;
    let dataProvider = {};
    let metaById = metaData;
    let graphPositions: any[] = [];
    let graphEdges: any[] = [];

    const layout = await getLayout(graph, dataProvider);

    consolelog('After Graph ', layout);

    const recurseChildren = (
      children: any[],
      rfArr: any[],
      rfParent: string,
    ) => {
      let counter = rfArr.length;

      for (let i = 0; i < children.length; i++) {
        const elkNode = children[i];
        const meta = metaById[elkNode?.id];
        meta.open = -1;
        //for parent containers
        meta.width = elkNode.width;
        meta.height = elkNode.height;
        //console.log(elkNode?.id, elkNode);
        //build node
        const rfNode = getReactFlowNode(
          meta.uuid, //counter,
          elkNode,
          meta.name + ' (' + meta['t'] + ')',
          meta,
          elkNode.width,
          elkNode.height,
          NetmapNodeType.UUID,
          true,
          rfParent,
          globalProps,
        );
        //console.log('rf', rfNode);
        counter++;
        doIt(elkNode, rfNode, rfArr);
      }
    };

    const doIt = (eNode: any, aNode: any, rfArr: any[]) => {
      //console.log('Add It');
      rfArr.push(aNode);
      if (eNode.hasOwnProperty('children') && eNode['children'].length > 0) {
        recurseChildren(eNode['children'], rfArr, eNode.id);
      }
    };

    //Build React Flow Nodes
    Object.entries(layout).map((d) => {
      //console.log('iii', key); //this is index
      //const index = d[0];
      const elkNode = d[1] as IElky;
      const meta = metaById[elkNode?.id];
      //for parent containers
      meta.width = elkNode.width;
      meta.height = elkNode.height;

      //const meta = metaById['id'];
      let isVisible = true;
      let nodeType = NetmapNodeType.UUID;
      let parent = '';

      //graphPositions.length
      const rfNode = getReactFlowNode(
        meta.uuid,
        elkNode,
        meta.name + ' (' + meta['t'] + ')',
        meta,
        elkNode.width,
        elkNode.height,
        nodeType,
        isVisible,
        parent,
        globalProps,
      );
      //console.log('level 1 RF', rfNode);
      doIt(elkNode, rfNode, graphPositions);

      return rfNode;
    });

    consolelog('Final graphPositions', graphPositions);
    consolelog('Final graphEdges', graphEdges);
    //graphEdges
    if (onModelCreated) {
      onModelCreated(graphPositions, graphEdges);
    }
  };

  return {
    createModel,
  };
};

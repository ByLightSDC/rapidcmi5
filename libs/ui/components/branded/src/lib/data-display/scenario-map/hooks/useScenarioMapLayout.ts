//import Graph from 'graphology';
//import forceLayout from 'graphology-layout-force';
import { useContext, useEffect, useState } from 'react';

import { IModelBase, LooseObject } from '../models/model-types';

import { ScenarioMapContext } from '../ScenarioMapContext';

interface ILayoutCache {
  currentVertex: number;
  bounds: [number, number, number, number];
  counts: Array<number>;
  numRootNodesPlaced: number;
  // origins: Array<Array<number>>;
  rects: Array<IModelBase>;
  lines: Array<[IPoint2D, IPoint2D]>;
  radius: number;
}

interface IPoint2D {
  x: number;
  y: number;
}

class Point2D implements IPoint2D {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export const useScenarioMapLayout = () => {
  const {
    graph,
    nodeBoxes,
    nodes,
    connectors,
    messages,
    positions,
    width,
    height,
    onLayoutUpdated,
  } = useContext(ScenarioMapContext);

  const [adjacencyArr, setAdjacencyArr] = useState<Array<Array<number>>>([]);
  const [sortedNodes, setSortedNodes] = useState<IModelBase[]>([]);

  const radToDegrees = 180 / Math.PI;
  const degreesToRad = Math.PI / 180;
  const startRootSingletonPosition = new Point2D(50, 50);
  const startTreePosition = new Point2D(50, 50);
  const tenDegreeRadians = 0.1744;

  /**
   * Returns intersection of 2 rectangles
   */
  const getIntersects = (
    l: number,
    t: number,
    r: number,
    b: number,
    placedL: number,
    placedT: number,
    placedR: number,
    placedB: number,
  ) => {
    console.log(` test ${l},${t},${r},${b}`);
    console.log(`against ${placedL},${placedT},${placedR},${placedB}`);
    console.log(t, placedB);
    console.log(placedB, t);
    if (l > placedR || placedL > r) {
      return false;
    }
    if (t > placedB || placedT > b) {
      return false;
    }
    return true;
  };

  /**
   * Finds next available position for a node that is not connected to anything
   * These are positioned last, after all of the trees have been constructed
   */
  const getRootSingletonPosition = (
    cache: ILayoutCache,
    width: number,
    height: number,
  ): Point2D => {
    //Start in upper left hand corner

    let point = new Point2D(
      startRootSingletonPosition.x,
      startRootSingletonPosition.y,
    );
    let isIntersect = false;
    for (let i = 0; i < 50; i++) {
      //check proposed rect against placed rects
      for (let j = 0; j < cache.rects.length; j++) {
        if (
          getIntersects(
            point.x,
            point.y,
            point.x + width,
            point.x + height,
            cache.rects[j].x,
            cache.rects[j].y,
            cache.rects[j].right,
            cache.rects[j].bottom,
          )
        ) {
          //console.log('rect ', point);
          //console.log('intersects with ', cache.rects[j]);
          isIntersect = true;
          break;
        }
      }

      if (!isIntersect) {
        return point;
      }

      // TODO calculate right bounds
      point.x += 50;
      console.log('add x ', point.x);
      //console.log(' cache.rects', cache.rects);
      if (point.x > 1000) {
        console.log('add y ', point.y);
        point.x = 50;
        point.y += 50;
      }
    }

    return new Point2D(9999, 9999);
  };

  /**
   * Find a position for a child, centered around parent origin that doesn't intersect any nodes previously placed
   * Iterate through 360 degrees, step increments determined by the total number of children to place around their parent
   */
  const getPosition = (
    originX: number,
    originY: number,
    childWidth: number,
    childHeight: number,
    numChildrenPlaced: number,
    numChildren: number,
    cache: ILayoutCache,
  ): Point2D => {
    let angleForOrphans = 0; //tenDegreeRadians;

    let angleIncrementRad =
      numChildren >= 2 ? (2 * Math.PI) / numChildren : tenDegreeRadians; //dont need incrementer for 1 child

    //OPT by starting with lastPlacedAngle instead of using number of children placed
    //intersections cause angle to get incremented so last Angle is more accurate than child index
    let angleRad =
      numChildren > 1 ? angleIncrementRad * numChildrenPlaced : angleForOrphans; //start at 0

    //try to find a good position X times
    let diffY = 0;
    let diffX = 0;
    let isIntersect = false;
    for (let i = 0; i < 36; i++) {
      //console.log('angleRad ', angleRad * radToDegrees);
      diffY = cache.radius * Math.sin(angleRad);
      diffX = cache.radius * Math.cos(angleRad);
      //check intersection with placed rects
      isIntersect = false;

      //check proposed rect against placed rects
      for (let j = 0; j < cache.rects.length; j++) {
        if (
          getIntersects(
            originX + diffX,
            originY + diffY,
            originX + diffX + childWidth,
            originY + diffY + childHeight,
            cache.rects[j].x,
            cache.rects[j].y,
            cache.rects[j].right,
            cache.rects[j].bottom,
          )
        ) {
          isIntersect = true;
          break;
        }
      }
      if (!isIntersect) {
        //console.log('' + cache.currentVertex + ' can be placed @' + angleRad);
        return new Point2D(originX + diffX, originY + diffY);
      }

      angleRad += tenDegreeRadians;
    }

    return new Point2D(9999, 9999);
  };

  const updateBounds = (
    x: number,
    y: number,
    r: number,
    b: number,
    cache: ILayoutCache,
  ) => {
    cache.bounds[0] = Math.min(x, cache.bounds[0]);
    cache.bounds[1] = Math.min(y, cache.bounds[1]);
    cache.bounds[2] = Math.max(r, cache.bounds[2]);
    cache.bounds[3] = Math.max(b, cache.bounds[3]);
  };

  /**
   * Create a list of all nodes, sort them by order based on what should occupy top left of canvas
   * Create a look up table of positions to dispatch
   * Create adjacency array used to traverse the graphs
   * Traverse the graphs, visit each node
   * Calculate Bounds
   * TODO- if positions go into negative space, adjust positions
   */
  const graphModel = () => {
    let graphNodeById: LooseObject = {};
    let allNodes: IModelBase[] = [];

    // Make Look Up
    for (let i = 0; i < nodes.length; i++) {
      allNodes.push(nodes[i]);
    }
    console.log('graph', graph);
    if (graph === null) {
      return;
    }
    // Math Cache
    let cache: ILayoutCache = {
      currentVertex: -1,
      bounds: [0, 0, 0, 0],
      counts: new Array<number>(allNodes.length).fill(-1),
      numRootNodesPlaced: 0,
      // origins: origins,
      rects: [],
      lines: [],
      radius: 150,
    };

    // Add to Master Positions List Dispatched to Draw Fxns
    //let left = startTreePosition.x;
    //let top = startTreePosition.y;
    const spread = 100;
    for (let i = 0; i < allNodes.length; i++) {
      allNodes[i].index = i;

      //Transfer Graph Position to Layout Position
      graphNodeById[allNodes[i].id] = allNodes[i];
      //allNodes[i].setPosition(left, top);
      allNodes[i].setPosition(graph[i].x, graph[i].y);
      updateBounds(
        allNodes[i].x,
        allNodes[i].y,
        allNodes[i].right,
        allNodes[i].bottom,
        cache,
      );
      cache.rects.push(allNodes[i]);
      // left = Math.max(left, graph[i].x);
      // if (left > 1000) {
      //   left = 50;
      //   top += spread;
      // }
    }

    console.log('bounds', cache.bounds);
    if (onLayoutUpdated) {
      onLayoutUpdated(graphNodeById, cache.bounds);
    }
  };

  const test = (clearTimer: Boolean = true) => {
    let graphNodeById = positions;
    const testNode = graphNodeById['06a9c079-8e3e-4a63-baa1-5e08dab1ebbd'];
    testNode.setPosition(testNode.x + 30, testNode.y);
    if (onLayoutUpdated) {
      onLayoutUpdated(graphNodeById, [0, 0, width, height]);
    }
  };

  useEffect(() => {
    if (messages?.length > 0) {
      test();
    }
  }, [messages]);

  return {
    graphModel,
    test,
  };
};

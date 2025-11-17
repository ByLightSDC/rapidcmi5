// import { useContext, useEffect, useState } from 'react';

// import { IModelBase, LooseObject } from '../models/model-types';

// import { ScenarioMapContext } from '../ScenarioMapContext';

// interface ILayoutCache {
//   currentVertex: number;
//   bounds: [number, number, number, number];
//   counts: Array<number>;
//   numRootNodesPlaced: number;
//   // origins: Array<Array<number>>;
//   rects: Array<IModelBase>;
//   lines: Array<[IPoint2D, IPoint2D]>;
//   radius: number;
// }

// interface IPoint2D {
//   x: number;
//   y: number;
// }

// class Point2D implements IPoint2D {
//   x: number;
//   y: number;
//   constructor(x: number, y: number) {
//     this.x = x;
//     this.y = y;
//   }
// }

// export const useScenarioMapLayout = () => {
//   const {
//     nodeBoxes,
//     nodes,
//     connectors,
//     messages,
//     positions,
//     width,
//     height,
//     onLayoutUpdated,
//   } = useContext(ScenarioMapContext);

//   const [adjacencyArr, setAdjacencyArr] = useState<Array<Array<number>>>([]);
//   const [sortedNodes, setSortedNodes] = useState<IModelBase[]>([]);

//   const radToDegrees = 180 / Math.PI;
//   const degreesToRad = Math.PI / 180;
//   const startRootSingletonPosition = new Point2D(50, 50);
//   const startTreePosition = new Point2D(50, 50);
//   const tenDegreeRadians = 0.1744;

//   /**
//    * Returns intersection of 2 rectangles
//    */
//   const getIntersects = (
//     l: number,
//     t: number,
//     r: number,
//     b: number,
//     placedL: number,
//     placedT: number,
//     placedR: number,
//     placedB: number
//   ) => {
//     console.log(` test ${l},${t},${r},${b}`);
//     console.log(`against ${placedL},${placedT},${placedR},${placedB}`);
//      console.log(t, placedB);
//      console.log(placedB, t);
//     if (l > placedR || placedL > r) {
//       return false;
//     }
//     if (t > placedB || placedT > b) {
//       return false;
//     }
//     return true;
//   };

//   /**
//    * Finds next available position for a node that is not connected to anything
//    * These are positioned last, after all of the trees have been constructed
//    */
//   const getRootSingletonPosition = (
//     cache: ILayoutCache,
//     width: number,
//     height: number
//   ): Point2D => {
//     //Start in upper left hand corner

//     let point = new Point2D(
//       startRootSingletonPosition.x,
//       startRootSingletonPosition.y
//     );
//     let isIntersect = false;
//     for (let i = 0; i < 50; i++) {
//       //check proposed rect against placed rects
//       for (let j = 0; j < cache.rects.length; j++) {
//         if (
//           getIntersects(
//             point.x,
//             point.y,
//             point.x + width,
//             point.x + height,
//             cache.rects[j].x,
//             cache.rects[j].y,
//             cache.rects[j].right,
//             cache.rects[j].bottom
//           )
//         ) {
//           //console.log('rect ', point);
//           //console.log('intersects with ', cache.rects[j]);
//           isIntersect = true;
//           break;
//         }
//       }

//       if (!isIntersect) {
//         return point;
//       }

//       // TODO calculate right bounds
//       point.x += 50;
//       console.log('add x ', point.x);
//       //console.log(' cache.rects', cache.rects);
//       if (point.x > 1000) {
//          console.log('add y ', point.y);
//         point.x = 50;
//         point.y += 50;
//       }
//     }

//     return new Point2D(9999, 9999);
//   };

//   /**
//    * Find a position for a child, centered around parent origin that doesn't intersect any nodes previously placed
//    * Iterate through 360 degrees, step increments determined by the total number of children to place around their parent
//    */
//   const getPosition = (
//     originX: number,
//     originY: number,
//     childWidth: number,
//     childHeight: number,
//     numChildrenPlaced: number,
//     numChildren: number,
//     cache: ILayoutCache
//   ): Point2D => {
//     let angleForOrphans = 0; //tenDegreeRadians;

//     let angleIncrementRad =
//       numChildren >= 2 ? (2 * Math.PI) / numChildren : tenDegreeRadians; //dont need incrementer for 1 child

//     //OPT by starting with lastPlacedAngle instead of using number of children placed
//     //intersections cause angle to get incremented so last Angle is more accurate than child index
//     let angleRad =
//       numChildren > 1 ? angleIncrementRad * numChildrenPlaced : angleForOrphans; //start at 0

//     //try to find a good position X times
//     let diffY = 0;
//     let diffX = 0;
//     let isIntersect = false;
//     for (let i = 0; i < 36; i++) {
//       //console.log('angleRad ', angleRad * radToDegrees);
//       diffY = cache.radius * Math.sin(angleRad);
//       diffX = cache.radius * Math.cos(angleRad);
//       //check intersection with placed rects
//       isIntersect = false;

//       //check proposed rect against placed rects
//       for (let j = 0; j < cache.rects.length; j++) {
//         if (
//           getIntersects(
//             originX + diffX,
//             originY + diffY,
//             originX + diffX + childWidth,
//             originY + diffY + childHeight,
//             cache.rects[j].x,
//             cache.rects[j].y,
//             cache.rects[j].right,
//             cache.rects[j].bottom
//           )
//         ) {
//           isIntersect = true;
//           break;
//         }
//       }
//       if (!isIntersect) {
//         //console.log('' + cache.currentVertex + ' can be placed @' + angleRad);
//         return new Point2D(originX + diffX, originY + diffY);
//       }

//       angleRad += tenDegreeRadians;
//     }

//     return new Point2D(9999, 9999);
//   };

//   const updateBounds = (
//     x: number,
//     y: number,
//     r: number,
//     b: number,
//     cache: ILayoutCache
//   ) => {
//     cache.bounds[0] = Math.min(x, cache.bounds[0]);
//     cache.bounds[1] = Math.min(y, cache.bounds[1]);
//     cache.bounds[2] = Math.max(r, cache.bounds[2]);
//     cache.bounds[3] = Math.max(b, cache.bounds[3]);
//   };

//   /**
//    * Create a list of all nodes, sort them by order based on what should occupy top left of canvas
//    * Create a look up table of positions to dispatch
//    * Create adjacency array used to traverse the graphs
//    * Traverse the graphs, visit each node
//    * Calculate Bounds
//    * TODO- if positions go into negative space, adjust positions
//    */
//   const graphModel = () => {
//     let graphNodeById: LooseObject = {};
//     let allNodes: IModelBase[] = [];
//     let sorter = ['package'];

//     // Make Look Up
//     for (let i = 0; i < nodes.length; i++) {
//       //dont need to layout subnet devices
//       if (nodes[i].parent) {
//         continue;
//       }
//       //console.log(nodes[i].id, nodes[i].name + ' ' + allNodes.length);
//       const sortIndex = sorter.indexOf(nodes[i].nodeType);
//       nodes[i].sort = sortIndex >= 0 ? sortIndex + 1 : 100;
//       allNodes.push(nodes[i]);
//     }
//     // for (let i = 0; i < nodeBoxes.length; i++) {
//     //   //console.log(nodeBoxes[i].id, nodeBoxes[i].name + ' ' + allNodes.length);
//     //   nodeBoxes[i].sort = 100;
//     //   allNodes.push(nodeBoxes[i]);
//     // }

//     // Sort by device type - draw internet, firewallm routers first, subnets last
//     allNodes.sort(function (a: IModelBase, b: IModelBase) {
//       if (a.sort && b.sort) {
//         return a.sort - b.sort;
//       }
//       return 100;
//     });

//     // Add to Master Positions List Dispatched to Draw Fxns
//     for (let i = 0; i < allNodes.length; i++) {
//       allNodes[i].index = i;
//       graphNodeById[allNodes[i].id] = allNodes[i];
//     }
//     setSortedNodes(allNodes);

//     //Graphing Algorithm -----------------------------------------------------

//     const V = allNodes.length;
//     let adjacencyArr: Array<Array<number>> = new Array(V).fill(0).map(() => []);
//     let isVisited: Array<boolean> = new Array(V).fill(false);
//     let level = 0;
//     //console.log('verts', allNodes);

//     // Create Adjacency Matrix
//     //TEMP add lines
//     // for (let i = 0; i < connectors.length; i++) {
//     //   const from = graphNodeById[connectors[i].meta['from']];
//     //   const to = graphNodeById[connectors[i].meta['to']];
//     //   adjacencyArr[from.index].push(to.index);
//     //   adjacencyArr[to.index].push(from.index);
//     // }
//     setAdjacencyArr(adjacencyArr);
//     //console.log('Adjacency Arr', adjacencyArr);

//     /**
//      * Recurse visit
//      */
//     const recurseVisit = (
//       v: number,
//       visited: Array<boolean>,
//       cache: ILayoutCache,
//       level: number,
//       childIndex: number,
//       childCount: number,
//       parentIndex: number
//     ) => {
//       return visit(
//         v,
//         visited,
//         cache,
//         level,
//         childIndex,
//         childCount,
//         parentIndex
//       );
//     };

//     /**
//      * Visit, Position Node
//      */
//     const visit = (
//       v: number,
//       visited: Array<boolean>,
//       cache: ILayoutCache,
//       level: number,
//       childIndex: number,
//       childCount: number,
//       parentIndex: number
//     ) => {
//       if (!visited[v]) {
//         cache.currentVertex = v;
//         console.log(
//           'Visit ' +
//             v +
//             allNodes[v].name +
//             ' index=' +
//             childIndex +
//             ' parent = ' +
//             parentIndex
//         );

//         if (
//           //TEMP
//           //REF for debug
//           //domain1[0, 2, 7, 1, 3, 9, 6, 12, 4, 10, 5, 11].indexOf(v) >= 0
//           v < 9999 //for debugging
//         ) {
//           if (parentIndex < 0) {
//             console.log('no parent');

//             if (cache.numRootNodesPlaced === 0) {
//               //TEMP only allow one root tree TODO deal with multiple trees
//               console.log('first position');
//               //allNodes[v].x = startTreePosition.x;
//               //allNodes[v].y = startTreePosition.y;
//               cache.numRootNodesPlaced++;

//               console.log('positionA', startTreePosition);
//               allNodes[v].setPosition(startTreePosition.x, startTreePosition.y);

//               updateBounds(
//                 allNodes[v].x,
//                 allNodes[v].y,
//                 allNodes[v].right,
//                 allNodes[v].bottom,
//                 cache
//               );
//               cache.rects.push(allNodes[v]);
//             } else {
//               console.log(
//                 'root nodes already placed',
//                 cache.numRootNodesPlaced
//               );
//               console.log('adjacencyArr[v].length', adjacencyArr[v].length);
//               //check singleton or tree
//               if (adjacencyArr[v].length === 0) {
//                 console.log('singleton', v);
//                 let position = getRootSingletonPosition(
//                   cache,
//                   allNodes[v].width,
//                   allNodes[v].height
//                 );
//                 console.log('positionB', position);
//                 //this was missing

//                 allNodes[v].setPosition(position.x, position.y);

//                 updateBounds(
//                   allNodes[v].x,
//                   allNodes[v].y,
//                   allNodes[v].right,
//                   allNodes[v].bottom,
//                   cache
//                 );
//                 cache.rects.push(allNodes[v]);
//                 //console.log('C', allNodes[v]);
//               } else {
//                 console.log('Multiple Trees not supported ' + v);
//                 allNodes[v].x = 9999;
//                 allNodes[v].y = 9999;
//               }
//             }
//           } else {
//             //childCount includes parent...
//             //order important, angle starts at 0 degrees
//             //Skip If Parent Is Not Visited!!!
//             if (!visited[parentIndex]) {
//               console.log(
//                 'PROBLEM HERE parent not positioned' + v,
//                 parentIndex
//               );
//               allNodes[v].x = 9999;
//               allNodes[v].y = 9999;
//               return;
//             }

//             cache.counts[parentIndex] = cache.counts[parentIndex] + 1;
//             const childrenPlaced = cache.counts[parentIndex];
//             //OPT const anglePlaced = cache.angles[parentIndex];
//             //console.log('Place V ' + v);
//             let position = getPosition(
//               allNodes[parentIndex].x,
//               allNodes[parentIndex].y,
//               allNodes[v].width,
//               allNodes[v].height,
//               childrenPlaced,
//               childCount,
//               cache
//             );

//             allNodes[v].setPosition(position.x, position.y);
//             updateBounds(
//               allNodes[v].x,
//               allNodes[v].y,
//               allNodes[v].right,
//               allNodes[v].bottom,
//               cache
//             );
//             cache.rects.push(allNodes[v]);
//           }
//         } else {
//           console.log('offscreen position');
//           allNodes[v].x = 9999;
//           allNodes[v].y = 9999;
//         }

//         //Find X, Y
//         visited[v] = true;

//         // Traverse the Adjacency List of current node v
//         level = level + 1;

//         const numChildren = adjacencyArr[v].length;
//         for (let j = 0; j < numChildren; j++) {
//           const childIndex: number = adjacencyArr[v][j];
//           if (!visited[childIndex]) {
//             recurseVisit(childIndex, visited, cache, level, j, numChildren, v);
//           }
//         }
//       }
//     };

//     // Store v center so we can arrange children around this origin
//     // let origins: Array<Array<number>> = new Array(V)
//     //   .fill(0)
//     //   .map(() => [-1, -1]);

//     // Math Cache
//     let cache: ILayoutCache = {
//       currentVertex: -1,
//       bounds: [0, 0, 0, 0],
//       counts: new Array<number>(V).fill(-1),
//       numRootNodesPlaced: 0,
//       // origins: origins,
//       rects: [],
//       lines: [],
//       radius: 150,
//     };

//     //Set starting position for level 0
//     for (let i = 0; i < V; i++) {
//       if (!isVisited[i]) {
//         level = 0;
//         visit(i, isVisited, cache, level, 0, adjacencyArr[i].length, -1);
//         cache.numRootNodesPlaced++;
//       }
//     }

//     console.log('bounds', cache.bounds);
//     if (onLayoutUpdated) {
//       onLayoutUpdated(graphNodeById, cache.bounds);
//     }
//   };

//   const test = (clearTimer: Boolean = true) => {
//     let graphNodeById = positions;
//     const testNode = graphNodeById['06a9c079-8e3e-4a63-baa1-5e08dab1ebbd'];
//     testNode.setPosition(testNode.x + 30, testNode.y);
//     if (onLayoutUpdated) {
//       onLayoutUpdated(graphNodeById, [0, 0, width, height]);
//     }
//   };

//   useEffect(() => {
//     if (messages?.length > 0) {
//       test();
//     }
//   }, [messages]);

//   return {
//     graphModel,
//     test,
//   };
// };

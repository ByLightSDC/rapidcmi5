// import { visit } from 'unist-util-visit';

// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const h = require('hastscript');

// const testRegex = /apple/g;
// const debugMe = true;

// export const examplePlugin = () => {
//   function transformer(tree: any) {
//     visit(tree, 'text', (node, position = -1, parent) => {
//       const definition = [];
//       let lastIndex = 0;
//       if (debugMe) {
//         console.log('imagePlugin node', node);
//         console.log('parent', parent);
//       }

//       const matches = [...node.value.matchAll(testRegex)];
//       if (matches.length > 0) {
//         for (const match of matches) {
//           const value = match[0];

//           // begin
//           if (debugMe) {
//             console.log('before', node.value.slice(lastIndex, match.index));
//           }
//           definition.push({
//             type: 'text',
//             value: node.value.slice(lastIndex, match.index),
//             position: { start: lastIndex, end: match.index },
//           });

//           //middle
//           if (debugMe) {
//             console.log(
//               'middle',
//               node.value.slice(match.index, match.index + value.length),
//             );
//           }

//           // WORKS replaces apple with MICO
//           definition.push({
//             type: 'text',
//             value: 'MICO', //node.value.slice(lastIndex, match.index),
//             position: {
//               start: match.index,
//               end: match.index + (value.length - 1),
//             },
//           });

//           lastIndex = match.index + value.length;
//           if (debugMe) {
//             console.log('last index', lastIndex);
//           }
//         }
//       }

//       if (lastIndex !== node.value.length) {
//         if (debugMe) {
//           console.log('rest', node.value.slice(lastIndex, node.value.length));
//         }
//         definition.push({
//           type: 'text',
//           value: node.value.slice(lastIndex, node.value.length),
//           position: {
//             start: lastIndex,
//             end: node.value.length - 1,
//           },
//         });
//       }

//       const last = parent.children.slice(position + 1);
//       parent.children = parent.children.slice(0, position);
//       parent.children = parent.children.concat(definition);
//       parent.children = parent.children.concat(last);
//     });
//   }

//   return transformer;
// };
